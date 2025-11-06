import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { createTripSchema } from '@/lib/validations';
import { z } from 'zod';

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
 * GET /api/trips
 * Get all trips for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
      return NextResponse.json({ error: '获取行程列表失败' }, { status: 500 });
    }

    return NextResponse.json({ trips: trips || [] }, { status: 200 });
  } catch (error) {
    console.error('Get trips error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * POST /api/trips
 * Create a new trip for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createTripSchema.parse(body);

    // Create trip in database
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        user_id: session.user.id,
        destination: validatedData.destination,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        total_budget: validatedData.totalBudget,
        num_adults: validatedData.numAdults,
        num_children: validatedData.numChildren,
        preferences: validatedData.preferences || {},
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trip:', error);
      return NextResponse.json({ error: '创建行程失败' }, { status: 500 });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create trip error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
