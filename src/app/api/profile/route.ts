import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { updateProfileSchema } from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: '获取个人资料失败' }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * PATCH /api/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const body = await request.json();

    // Validate request body
    const validatedData = updateProfileSchema.parse(body);

    // Update user profile
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.displayName !== undefined) {
      updateData.display_name = validatedData.displayName;
    }
    if (validatedData.avatarUrl !== undefined) {
      updateData.avatar_url = validatedData.avatarUrl || null;
    }
    if (validatedData.defaultBudget !== undefined) {
      updateData.default_budget = validatedData.defaultBudget;
    }
    if (validatedData.defaultCity !== undefined) {
      updateData.default_city = validatedData.defaultCity;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: '更新个人资料失败' }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update profile error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
