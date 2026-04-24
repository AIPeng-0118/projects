import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json({ success: false, error: "无效的用户ID" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("game_records")
      .select("*")
      .eq("user_id", userIdNum)
      .order("played_at", { ascending: false });

    if (error) {
      console.error("获取游戏记录失败:", error);
      return NextResponse.json({ success: false, error: "获取记录失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error("获取游戏记录异常:", err);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
