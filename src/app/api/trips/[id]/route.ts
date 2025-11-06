import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

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
 * GET /api/trips/[id]
 * Get a single trip by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching trip:', error);
      return NextResponse.json({ error: '获取行程详情失败' }, { status: 500 });
    }

    if (!trip) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 });
    }

    return NextResponse.json({ trip }, { status: 200 });
  } catch (error) {
    console.error('Get trip error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
