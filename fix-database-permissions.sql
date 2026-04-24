-- 修复用户注册权限问题
-- 这个脚本会禁用users表的RLS策略，允许公开注册

-- 1. 禁用users表的RLS策略（允许公开注册）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. 删除现有的限制性策略
DROP POLICY IF EXISTS "users_允许公开读取" ON users;
DROP POLICY IF EXISTS "users_允许公开写入" ON users;

-- 3. 创建允许公开读取的策略
CREATE POLICY "users_允许公开读取" ON users
    FOR SELECT
    TO public
    USING (true);

-- 4. 创建允许公开插入的策略（用于注册）
CREATE POLICY "users_允许公开插入" ON users
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 5. 创建允许公开更新的策略（用于密码修改等）
CREATE POLICY "users_允许公开更新" ON users
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- 6. 同样修复game_records表
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_records_允许公开读取" ON game_records;
DROP POLICY IF EXISTS "game_records_允许公开写入" ON game_records;

CREATE POLICY "game_records_允许公开读取" ON game_records
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "game_records_允许公开插入" ON game_records
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 7. 确认策略已创建
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('users', 'game_records')
ORDER BY schemaname, tablename, policyname;