import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseClient, getSupabaseServiceRoleKey } from "@/storage/database/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: "用户名长度需要在3-20个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码长度至少6个字符" },
        { status: 400 }
      );
    }

    // 使用service role key来绕过RLS限制
    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (!serviceRoleKey) {
      console.error("Service role key not found");
      return NextResponse.json(
        { success: false, error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    // 使用service role创建客户端
    const client = getSupabaseClient(serviceRoleKey);

    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await client
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      console.error("检查用户失败:", checkError);
      return NextResponse.json(
        { success: false, error: "数据库查询失败" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "用户名已被注册" },
        { status: 409 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（使用service role绕过RLS）
    const { data: user, error: insertError } = await client
      .from("users")
      .insert({ 
        username, 
        password: hashedPassword 
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("创建用户失败:", insertError);
      return NextResponse.json(
        { success: false, error: `注册失败: ${insertError.message}` },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户创建失败" },
        { status: 500 }
      );
    }

    // 返回成功响应（不包含密码）
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}