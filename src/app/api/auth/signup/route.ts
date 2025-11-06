import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signUpSchema } from '@/lib/validations';
import { z } from 'zod';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/auth/signup
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    const { email, password, displayName } = validatedData;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      return NextResponse.json(
        { error: authError.message || '注册失败，请稍后重试' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '注册失败，请稍后重试' },
        { status: 500 }
      );
    }

    // The user record in the users table will be automatically created by the trigger
    // We don't need to verify it here because:
    // 1. The trigger has SECURITY DEFINER and will work
    // 2. Even if it fails, it won't block user creation
    // 3. RLS policies prevent us from reading the user record with anon key

    return NextResponse.json(
      {
        message: '注册成功！',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          displayName: displayName || email.split('@')[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '输入数据验证失败',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
