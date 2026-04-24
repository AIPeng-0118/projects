import { getSupabaseClient } from "@/storage/database/supabase-client";

export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

// 获取所有文章
export async function getAllPosts(): Promise<BlogPost[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, summary, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`查询文章列表失败: ${error.message}`);
  return data as BlogPost[];
}

// 根据ID获取文章详情
export async function getPostById(id: number): Promise<BlogPost | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`查询文章详情失败: ${error.message}`);
  return data as BlogPost | null;
}

// 创建文章
export async function createPost(
  title: string,
  summary: string,
  content: string
): Promise<BlogPost> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("blog_posts")
    .insert({ title, summary, content })
    .select()
    .single();

  if (error) throw new Error(`创建文章失败: ${error.message}`);
  return data as BlogPost;
}

// 检查文章是否存在
export async function checkPostExists(title: string): Promise<boolean> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("blog_posts")
    .select("id")
    .eq("title", title)
    .maybeSingle();

  if (error) throw new Error(`检查文章失败: ${error.message}`);
  return data !== null;
}

// ============ 用户相关操作 ============

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

// 根据用户名获取用户
export async function getUserByUsername(username: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(`查询用户失败: ${error.message}`);
  return data as User | null;
}

// 创建用户
export async function createUser(
  username: string,
  hashedPassword: string
): Promise<User> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("users")
    .insert({ username, password: hashedPassword })
    .select()
    .single();

  if (error) throw new Error(`创建用户失败: ${error.message}`);
  return data as User;
}

// ============ 游戏记录相关操作 ============

export interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

// 创建游戏记录
export async function createGameRecord(
  userId: number,
  scenario: string,
  finalScore: number,
  result: string
): Promise<GameRecord> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("game_records")
    .insert({ user_id: userId, scenario, final_score: finalScore, result })
    .select()
    .single();

  if (error) throw new Error(`创建游戏记录失败: ${error.message}`);
  return data as GameRecord;
}

// 获取用户的游戏记录列表
export async function getUserGameRecords(userId: number): Promise<GameRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("game_records")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false });

  if (error) throw new Error(`查询游戏记录失败: ${error.message}`);
  return data as GameRecord[];
}
