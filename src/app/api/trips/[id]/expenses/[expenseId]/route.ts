import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { updateExpenseSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * PUT /api/trips/[id]/expenses/[expenseId]
 * Update an expense
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { id: tripId, expenseId } = params;

    // Verify the trip belongs to the user
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

    // Verify the expense belongs to this trip
    const { data: existingExpense, error: expenseCheckError } = await supabase
      .from('expenses')
      .select('id, trip_id')
      .eq('id', expenseId)
      .single();

    if (expenseCheckError || !existingExpense) {
      return NextResponse.json({ error: '费用记录不存在' }, { status: 404 });
    }

    if (existingExpense.trip_id !== tripId) {
      return NextResponse.json(
        { error: '费用记录不属于此行程' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = updateExpenseSchema.parse(body);

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (validatedData.amount !== undefined)
      updateData.amount = validatedData.amount;
    if (validatedData.currency !== undefined)
      updateData.currency = validatedData.currency;
    if (validatedData.category !== undefined)
      updateData.category = validatedData.category;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.receiptUrl !== undefined)
      updateData.receipt_url = validatedData.receiptUrl;
    if (validatedData.recordedAt !== undefined)
      updateData.recorded_at = validatedData.recordedAt;

    // Update expense
    const { data: expense, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      return NextResponse.json({ error: '更新费用记录失败' }, { status: 500 });
    }

    return NextResponse.json({ expense }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update expense error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * DELETE /api/trips/[id]/expenses/[expenseId]
 * Delete an expense
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { id: tripId, expenseId } = params;

    // Verify the trip belongs to the user
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

    // Verify the expense belongs to this trip
    const { data: existingExpense, error: expenseCheckError } = await supabase
      .from('expenses')
      .select('id, trip_id')
      .eq('id', expenseId)
      .single();

    if (expenseCheckError || !existingExpense) {
      return NextResponse.json({ error: '费用记录不存在' }, { status: 404 });
    }

    if (existingExpense.trip_id !== tripId) {
      return NextResponse.json(
        { error: '费用记录不属于此行程' },
        { status: 403 }
      );
    }

    // Delete expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: '删除费用记录失败' }, { status: 500 });
    }

    return NextResponse.json({ message: '费用记录已删除' }, { status: 200 });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
