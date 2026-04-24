import { NextRequest, NextResponse } from "next/server";
import { createGameRecord } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId, scenario, finalScore, result } = await request.json();

    // 验证参数
    if (!userId || !scenario || finalScore === undefined || !result) {
      return NextResponse.json(
        { success: false, error: "参数不完整" },
        { status: 400 }
      );
    }

    // 保存游戏记录
    const record = await createGameRecord(userId, scenario, finalScore, result);

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("保存游戏记录失败:", error);
    return NextResponse.json(
      { success: false, error: "保存游戏记录失败" },
      { status: 500 }
    );
  }
}
