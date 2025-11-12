import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type {
  ExpenseStats,
  CategoryExpenseBreakdown,
  ExpenseCategory,
} from '@/types/expense';

/**
 * GET /api/trips/[id]/expenses/stats
 * Get expense statistics for a specific trip
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

    // First verify the trip belongs to the user and get budget info
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id, total_budget')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 });
    }

    if (trip.user_id !== session.user.id) {
      return NextResponse.json({ error: '无权访问此行程' }, { status: 403 });
    }

    // Get all expenses for this trip
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount, category, currency')
      .eq('trip_id', tripId);

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
      return NextResponse.json({ error: '获取费用记录失败' }, { status: 500 });
    }

    // Calculate statistics
    const totalBudget = trip.total_budget;
    const expenseList = expenses || [];

    // Calculate total spent (assuming all in CNY for now, TODO: handle currency conversion)
    const totalSpent = expenseList.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    const remainingBudget = totalBudget - totalSpent;
    const budgetUsagePercentage =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate breakdown by category
    const categoryMap = new Map<ExpenseCategory, number[]>();

    expenseList.forEach((expense) => {
      const category = expense.category as ExpenseCategory;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(Number(expense.amount));
    });

    const breakdown: CategoryExpenseBreakdown[] = Array.from(
      categoryMap.entries()
    ).map(([category, amounts]) => {
      const total = amounts.reduce((sum, amount) => sum + amount, 0);
      const count = amounts.length;
      const average = count > 0 ? total / count : 0;
      const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;

      return {
        category,
        total,
        count,
        average,
        percentage,
      };
    });

    // Sort breakdown by total (descending)
    breakdown.sort((a, b) => b.total - a.total);

    const stats: ExpenseStats = {
      trip_id: tripId,
      total_budget: totalBudget,
      total_spent: totalSpent,
      remaining_budget: remainingBudget,
      budget_usage_percentage: Math.round(budgetUsagePercentage * 100) / 100,
      expense_count: expenseList.length,
      breakdown,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Get expense stats error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
