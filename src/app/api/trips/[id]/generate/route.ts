import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { generateTripItinerary } from '@/lib/ai';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

// Use service role key to bypass RLS in server-side API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/trips/[id]/generate
 * Generate AI itinerary for a trip
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // Fetch the trip
    const { data: trip, error: fetchError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !trip) {
      return NextResponse.json(
        { error: '行程不存在或无权访问' },
        { status: 404 }
      );
    }

    // Check if itinerary already exists
    if (
      trip.itinerary &&
      Array.isArray(trip.itinerary) &&
      trip.itinerary.length > 0
    ) {
      return NextResponse.json(
        { error: '行程已存在，请先删除现有行程' },
        { status: 400 }
      );
    }

    // Generate itinerary using AI
    const itinerary = await generateTripItinerary({
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      totalBudget: trip.total_budget,
      numAdults: trip.num_adults,
      numChildren: trip.num_children,
      preferences: trip.preferences,
    });

    // Update trip with generated itinerary
    const { data: updatedTrip, error: updateError } = await supabase
      .from('trips')
      .update({
        itinerary: itinerary.days,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating trip:', updateError);
      return NextResponse.json({ error: '保存行程失败' }, { status: 500 });
    }

    return NextResponse.json(
      {
        trip: updatedTrip,
        itinerary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate itinerary error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '生成行程失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}
