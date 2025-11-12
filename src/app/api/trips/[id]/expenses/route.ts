import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createExpenseSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/trips/[id]/expenses
 * Get all expenses for a specific trip
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const tripId = params.id;

    // First verify the trip belongs to the user
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 });
    }

    if (trip.user_id !== session.user.id) {
      return NextResponse.json({ error: '无权访问此行程' }, { status: 403 });
    }

    // Get all expenses for this trip
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return NextResponse.json({ error: '获取费用记录失败' }, { status: 500 });
    }

    return NextResponse.json({ expenses: expenses || [] }, { status: 200 });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * POST /api/trips/[id]/expenses
 * Create a new expense for a trip
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

    const supabase = getSupabaseAdmin();
    const tripId = params.id;

    // First verify the trip belongs to the user
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 });
    }

    if (trip.user_id !== session.user.id) {
      return NextResponse.json({ error: '无权访问此行程' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body (merge tripId from params)
    const validatedData = createExpenseSchema.parse({
      ...body,
      tripId,
    });

    // Create expense in database
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        category: validatedData.category,
        description: validatedData.description,
        receipt_url: validatedData.receiptUrl,
        recorded_at: validatedData.recordedAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json({ error: '创建费用记录失败' }, { status: 500 });
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create expense error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
