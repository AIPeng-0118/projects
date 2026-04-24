import { config } from "dotenv";
import { getSupabaseClient, getSupabaseServiceRoleKey } from "./src/storage/database/supabase-client";
import bcrypt from "bcryptjs";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function testRegisterWithServiceRole() {
  console.log("开始测试用户注册（使用Service Role Key）...");

  try {
    // 检查 Service Role Key 是否存在
    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (!serviceRoleKey) {
      console.log("❌ Service Role Key 未找到");
      return;
    }
    console.log("✅ Service Role Key 已找到");

    // 使用 service role 创建客户端
    const client = getSupabaseClient(serviceRoleKey);
    console.log("✅ Supabase 客户端创建成功（使用Service Role）");

    const testUsername = `test_user_${Date.now()}`;
    const testPassword = "test123456";

    console.log(`\n测试注册用户: ${testUsername}`);

    // 1. 先检查用户是否存在
    console.log("\n1. 检查用户是否存在...");
    const { data: existingUser, error: checkError } = await client
      .from("users")
      .select("id")
      .eq("username", testUsername)
      .maybeSingle();

    if (checkError) {
      console.log("❌ 检查用户失败:", checkError.message);
      console.log("错误详情:", JSON.stringify(checkError, null, 2));
      return;
    } else {
      console.log("✅ 用户不存在，可以注册");
    }

    // 2. 哈希密码
    console.log("\n2. 哈希密码...");
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log("✅ 密码哈希成功");

    // 3. 尝试插入用户
    console.log("\n3. 尝试插入用户...");
    const { data: newUser, error: insertError } = await client
      .from("users")
      .insert({ 
        username: testUsername, 
        password: hashedPassword 
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.log("❌ 用户插入失败:", insertError.message);
      console.log("错误详情:", JSON.stringify(insertError, null, 2));
      return;
    }

    if (!newUser) {
      console.log("❌ 用户创建失败（未返回数据）");
      return;
    }

    console.log("✅ 用户注册成功:", {
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.created_at
    });

    // 4. 测试查询刚创建的用户
    console.log("\n4. 查询刚创建的用户...");
    const { data: queryUser, error: queryError } = await client
      .from("users")
      .select("*")
      .eq("username", testUsername)
      .maybeSingle();

    if (queryError) {
      console.log("❌ 查询失败:", queryError.message);
    } else {
      console.log("✅ 用户查询成功:", {
        id: queryUser.id,
        username: queryUser.username,
        createdAt: queryUser.created_at
      });
    }

    // 5. 清理测试数据
    console.log("\n5. 清理测试数据...");
    const { error: deleteError } = await client
      .from("users")
      .delete()
      .eq("username", testUsername);
      
    if (deleteError) {
      console.log("❌ 测试数据清理失败:", deleteError.message);
    } else {
      console.log("✅ 测试数据清理成功");
    }

    console.log("\n🎉 注册功能测试完成！注册功能正常工作！");

  } catch (error) {
    console.error("\n❌ 注册测试失败:", error);
    process.exit(1);
  }
}

testRegisterWithServiceRole();