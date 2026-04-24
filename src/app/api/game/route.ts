import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { GameRequest, GameResponse } from "@/lib/types";
import { buildGamePrompt, parseGameResponse } from "@/lib/game";

// 胜利/失败的台词
const WIN_MESSAGES = {
  girlfriend: [
    "好吧好吧，看你这么诚恳的份上，我原谅你了！但是下次不许再犯了哦~",
    "哼，算你还有点良心，这次就放过你啦！",
    "好啦好啦，我又不是真的生气，就是想让你紧张一下嘛~爱你哟~",
  ],
  boyfriend: [
    "行吧，看你态度还可以，这次就算了，不许有下次啊！",
    "算你过关了，不过你给我记住，下次可没这么好说话了！",
    "好啦好啦，我就是故意逗你的，谁让你昨天不回消息的~",
  ],
};

const LOSE_MESSAGES = {
  girlfriend: [
    "你根本就不是来哄我的，你就是来气我的吧？我们冷静一下吧。",
    "算了，我不想说话了，你自己去想想吧。",
    "我真的好失望，你就不能认真一点吗？",
  ],
  boyfriend: [
    "你要是只会说这些，那我不想听了。",
    "行吧，随便你，反正你也觉得无所谓对吧？",
    "我不想说话了，你也别来找我了。",
  ],
};

export async function POST(request: NextRequest): Promise<NextResponse<GameResponse>> {
  try {
    const body: GameRequest = await request.json();
    const { sceneId, gender, round, currentAffection, messages, chosenOption } = body;

    // 构建prompt
    const prompt = buildGamePrompt(sceneId, gender, round, currentAffection, messages, chosenOption);

    // 调用LLM
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    let fullContent = "";

    try {
      const stream = client.stream(
        [
          { role: "system", content: "你是一个角色扮演游戏的AI助手。用户会给你一个场景，你需要按照指定格式输出JSON。" },
          { role: "user", content: prompt },
        ],
        {
          model: "doubao-seed-2-0-pro-260215",
          temperature: 0.8,
        }
      );

      for await (const chunk of stream) {
        if (chunk.content) {
          fullContent += chunk.content.toString();
        }
      }
    } catch (llmError) {
      console.error("LLM调用失败:", llmError);
      return NextResponse.json(
        { success: false, error: "连接失败，请重试" },
        { status: 500 }
      );
    }

    // 解析响应
    const parsed = parseGameResponse(fullContent);

    if (!parsed) {
      console.error("解析响应失败:", fullContent);
      return NextResponse.json(
        { success: false, error: "生成内容格式错误，请重试" },
        { status: 500 }
      );
    }

    // 计算新的好感度
    const newAffection = Math.max(-50, Math.min(100, currentAffection + parsed.affectionChange));

    // 检查游戏是否结束
    const isWin = newAffection >= 80;
    const isLose = newAffection < -50 || (round >= 10 && newAffection < 80);

    // 如果游戏结束，返回结束语
    if (isWin || isLose) {
      const endMessages = isWin ? WIN_MESSAGES[gender] : LOSE_MESSAGES[gender];
      const randomEnd = endMessages[Math.floor(Math.random() * endMessages.length)];

      return NextResponse.json({
        success: true,
        data: {
          message: randomEnd,
          affectionChange: parsed.affectionChange,
          emotionState: parsed.emotionState,
          options: parsed.options,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: parsed.message,
        affectionChange: parsed.affectionChange,
        emotionState: parsed.emotionState,
        options: parsed.options,
      },
    });
  } catch (error) {
    console.error("处理请求失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
