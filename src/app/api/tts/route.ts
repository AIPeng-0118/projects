import { NextRequest, NextResponse } from "next/server";
import { TTSClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { TTSRequest, TTSResponse } from "@/lib/types";

// 过滤文本中的括号内容（神态动作描述）
const cleanTextForTTS = (text: string): string => {
  return text
    .replace(/（[^）]*）/g, "")  // 移除中文括号内容
    .replace(/\([^)]*\)/g, "")   // 移除英文括号内容
    .trim();
};

export async function POST(request: NextRequest): Promise<NextResponse<TTSResponse>> {
  try {
    const body: TTSRequest = await request.json();
    const { text, speaker } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "文本内容不能为空" },
        { status: 400 }
      );
    }

    // 清理文本，移除括号内的神态动作描述
    const cleanedText = cleanTextForTTS(text);
    
    if (!cleanedText) {
      return NextResponse.json(
        { success: false, error: "清理后文本为空" },
        { status: 400 }
      );
    }

    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new TTSClient(config, customHeaders);

    const response = await client.synthesize({
      uid: `user_${Date.now()}`,
      text: cleanedText,
      speaker: speaker || "zh_female_xiaohe_uranus_bigtts",
      audioFormat: "mp3",
    });

    return NextResponse.json({
      success: true,
      audioUri: response.audioUri,
    });
  } catch (error) {
    console.error("TTS生成失败:", error);
    return NextResponse.json(
      { success: false, error: "语音生成失败，请重试" },
      { status: 500 }
    );
  }
}
