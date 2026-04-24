import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // 获取每个用户的最高分数记录
    const { data, error } = await supabase
      .from("game_records")
      .select(`
        id,
        user_id,
        scenario,
        final_score,
        result,
        played_at,
        users(username)
      `)
      .order("final_score", { ascending: false })
      .limit(10);

    if (error) {
      console.error("获取排行榜失败:", error);
      return NextResponse.json({ success: false, error: "获取排行榜失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error("获取排行榜异常:", err);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
