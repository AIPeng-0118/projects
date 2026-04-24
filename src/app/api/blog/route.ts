import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/db";

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("获取文章列表失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文章列表失败" },
      { status: 500 }
    );
  }
}
