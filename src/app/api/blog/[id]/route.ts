import { NextResponse } from "next/server";
import { getPostById } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: "无效的文章ID" },
        { status: 400 }
      );
    }

    const post = await getPostById(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("获取文章详情失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文章详情失败" },
      { status: 500 }
    );
  }
}
