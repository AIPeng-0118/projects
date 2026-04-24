import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { createPost } from "@/lib/db";

const SYSTEM_PROMPT = `你是一个专业的恋爱技巧内容创作者，专门撰写恋爱沟通技巧类文章。

请根据用户指定的恋爱话题，生成一篇高质量的文章。

要求：
1. 标题要吸引人，能引发读者好奇心
2. 摘要要简洁明了，概括文章核心观点
3. 内容要有实用价值，提供具体的技巧和方法
4. 语气轻松幽默，像朋友之间的聊天
5. 使用 Markdown 格式，包括适当的标题、列表、引用等
6. 文章长度适中（800-1200字左右）
7. 包含具体的例子或场景，让读者能够学以致用

请严格按以下 JSON 格式输出，不要添加任何其他内容：
{
  "title": "文章标题",
  "summary": "文章摘要（50字以内）",
  "content": "文章正文（Markdown格式）"
}`;

const TOPICS = [
  "如何正确表达不满",
  "异地恋如何维持感情",
  "吵架后的和解技巧",
  "如何给伴侣安全感",
  "伴侣沟通的雷区",
  "如何表达爱意",
  "处理冷战的正确方式",
  "约会中的小技巧",
  "如何倾听伴侣",
  "感情中的边界感",
];

export async function POST(request: NextRequest) {
  try {
    // 随机选择一个话题
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const config = new Config();
    const client = new LLMClient(config);

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `请为"哄哄模拟器"生成一篇关于恋爱沟通技巧的文章。\n\n话题：${randomTopic}\n\n要求：\n1. 标题要吸引年轻情侣\n2. 内容实用，有具体可操作的建议\n3. 保持轻松幽默的风格\n4. 适合游戏玩家群体（年轻人为主）` },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.8,
    });

    // 解析 LLM 返回的 JSON
    let articleData;
    try {
      // 尝试提取 JSON（可能有 markdown 代码块包裹）
      const content = response.content.trim();
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\})/);

      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        articleData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("解析 LLM 返回失败:", parseError, response.content);
      return NextResponse.json(
        { success: false, error: "生成的文章格式错误" },
        { status: 500 }
      );
    }

    // 保存到数据库
    const post = await createPost(
      articleData.title,
      articleData.summary,
      articleData.content
    );

    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        title: post.title,
        summary: post.summary,
      },
    });
  } catch (error) {
    console.error("生成文章失败:", error);
    return NextResponse.json(
      { success: false, error: "生成文章失败" },
      { status: 500 }
    );
  }
}
