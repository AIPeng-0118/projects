import { config } from "dotenv";
import { getSupabaseClient } from "./src/storage/database/supabase-client";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function testRegister() {
  console.log("开始测试用户注册...");

  try {
    const client = getSupabaseClient();
    console.log("✅ Supabase 客户端创建成功");

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
    } else {
      console.log("✅ 用户不存在，可以注册");
    }

    // 2. 尝试插入用户
    console.log("\n2. 尝试插入用户...");
    const { data: newUser, error: insertError } = await client
      .from("users")
      .insert({ 
        username: testUsername, 
        password: testPassword 
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.log("❌ 用户插入失败:", insertError.message);
      console.log("错误详情:", JSON.stringify(insertError, null, 2));
      
      // 分析错误类型
      if (insertError.message.includes("permission") || insertError.message.includes("权限")) {
        console.log("\n🔍 问题分析：数据库权限问题");
        console.log("💡 解决方案：需要在Supabase控制台中修改RLS策略");
      } else if (insertError.message.includes("duplicate") || insertError.message.includes("已存在")) {
        console.log("\n🔍 问题分析：用户名已存在");
      } else if (insertError.message.includes("does not exist") || insertError.message.includes("不存在")) {
        console.log("\n🔍 问题分析：表不存在");
      }
    } else {
      console.log("✅ 用户注册成功:", newUser);
      
      // 3. 测试查询刚创建的用户
      console.log("\n3. 查询刚创建的用户...");
      const { data: queryUser, error: queryError } = await client
        .from("users")
        .select("*")
        .eq("username", testUsername)
        .maybeSingle();

      if (queryError) {
        console.log("❌ 查询失败:", queryError.message);
      } else {
        console.log("✅ 用户查询成功:", queryUser);
      }

      // 4. 清理测试数据
      console.log("\n4. 清理测试数据...");
      const { error: deleteError } = await client
        .from("users")
        .delete()
        .eq("username", testUsername);
        
      if (deleteError) {
        console.log("❌ 测试数据清理失败:", deleteError.message);
      } else {
        console.log("✅ 测试数据清理成功");
      }
    }

    console.log("\n🎉 注册测试完成！");

  } catch (error) {
    console.error("\n❌ 注册测试失败:", error);
    process.exit(1);
  }
}

testRegister();