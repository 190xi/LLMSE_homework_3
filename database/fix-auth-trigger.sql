-- ============================================
-- Fix: Supabase Auth Trigger - 修复用户注册问题
-- ============================================
-- 问题：RLS策略阻止了触发器的INSERT操作
-- 解决：为触发器添加特殊权限，允许其绕过RLS策略

-- ============================================
-- 1. 删除有问题的INSERT策略
-- ============================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- ============================================
-- 2. 创建新的INSERT策略 - 允许service role插入
-- ============================================
-- 允许通过触发器（service role）插入用户记录
CREATE POLICY "Enable insert for service role"
ON users FOR INSERT
WITH CHECK (true);  -- 允许所有插入（RLS仍然启用，但这个策略允许所有插入）

-- 或者更安全的方式：只允许未认证用户（注册时）和service role插入
-- CREATE POLICY "Enable insert for new users"
-- ON users FOR INSERT
-- WITH CHECK (auth.uid() IS NULL OR auth.uid() = id);

-- ============================================
-- 3. 确保触发器函数有SECURITY DEFINER权限
-- ============================================
-- SECURITY DEFINER允许函数以定义者（通常是超级用户）的权限运行
-- 这样可以绕过RLS限制

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER  -- 关键：以定义者权限运行
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止用户创建
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- 4. 重新创建触发器
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. 验证配置
-- ============================================
-- 运行以下查询来验证：

-- 检查触发器是否存在
-- SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 检查函数是否有SECURITY DEFINER
-- SELECT proname, prosecdef FROM pg_proc WHERE proname = 'handle_new_user';

-- 检查RLS策略
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- ============================================
-- 6. 清理测试数据（可选）
-- ============================================
-- 如果之前注册失败，需要清理auth.users中的残留数据
-- 注意：请谨慎执行，确保不会删除重要数据

-- 查看所有用户
-- SELECT id, email, created_at FROM auth.users;

-- 删除没有对应users记录的auth用户（可选）
-- DELETE FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.users);
