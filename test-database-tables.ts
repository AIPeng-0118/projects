import { config } from "dotenv";
import { getSupabaseClient } from "./src/storage/database/supabase-client";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function testDatabaseTables() {
  console.log("开始测试数据库表...");

  try {
    const client = getSupabaseClient();
    console.log("✅ Supabase 客户端创建成功");

    // 测试 users 表
    console.log("\n测试查询 users 表...");
    const { data: usersData, error: usersError } = await client
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.log("❌ users 表查询失败:", usersError.message);
      console.log("错误详情:", JSON.stringify(usersError, null, 2));
    } else {
      console.log("✅ users 表存在，数据:", usersData);
    }

    // 测试插入用户
    console.log("\n测试插入用户...");
    const testUsername = `test_user_${Date.now()}`;
    const { data: insertData, error: insertError } = await client
      .from("users")
      .insert({ 
        username: testUsername, 
        password: "test_password_hash_123456" 
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.log("❌ 用户插入失败:", insertError.message);
      console.log("错误详情:", JSON.stringify(insertError, null, 2));
      
      // 检查是否是权限问题
      if (insertError.message.includes("permission") || insertError.message.includes("权限")) {
        console.log("🔍 可能原因：数据库权限问题");
      }
      // 检查是否是表不存在问题
      if (insertError.message.includes("does not exist") || insertError.message.includes("不存在")) {
        console.log("🔍 可能原因：表不存在");
      }
    } else {
      console.log("✅ 用户插入成功:", insertData);
      
      // 清理测试数据
      console.log("\n清理测试数据...");
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

    console.log("\n🎉 数据库表测试完成！");

  } catch (error) {
    console.error("\n❌ 数据库测试失败:", error);
    process.exit(1);
  }
}

testDatabaseTables();