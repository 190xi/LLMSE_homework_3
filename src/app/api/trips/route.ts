import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createTripSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/trips
 * Get all trips for the authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

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

    const supabase = getSupabaseAdmin();

    const body = await request.json();

    // Validate request body
    const validatedData = createTripSchema.parse(body);

    console.log('Creating trip with data:', {
      userId: session.user.id,
      destination: validatedData.destination,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
    });

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
      console.error('Error creating trip:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json({ error: '创建行程失败' }, { status: 500 });
    }

    console.log('Trip created successfully:', trip.id);
    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create trip error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details:
        error instanceof Error ? error.stack : JSON.stringify(error, null, 2),
      hint: '',
      code: '',
    });
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
