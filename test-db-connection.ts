import { config } from "dotenv";
import { getSupabaseClient } from "./src/storage/database/supabase-client";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function testDatabaseConnection() {
  console.log("开始测试数据库连接...");

  try {
    const client = getSupabaseClient();
    console.log("✅ Supabase 客户端创建成功");

    // 测试连接：尝试查询数据库表
    console.log("\n测试查询 blog_posts 表...");
    const { data: blogPosts, error: blogError } = await client
      .from("blog_posts")
      .select("count")
      .limit(1);

    if (blogError) {
      console.log("❌ blog_posts 表查询失败:", blogError.message);
    } else {
      console.log("✅ blog_posts 表连接成功");
    }

    console.log("\n测试查询 users 表...");
    const { data: users, error: userError } = await client
      .from("users")
      .select("count")
      .limit(1);

    if (userError) {
      console.log("❌ users 表查询失败:", userError.message);
    } else {
      console.log("✅ users 表连接成功");
    }

    console.log("\n测试查询 game_records 表...");
    const { data: records, error: recordError } = await client
      .from("game_records")
      .select("count")
      .limit(1);

    if (recordError) {
      console.log("❌ game_records 表查询失败:", recordError.message);
    } else {
      console.log("✅ game_records 表连接成功");
    }

    console.log("\n🎉 数据库连接测试完成！");

  } catch (error) {
    console.error("\n❌ 数据库连接测试失败:", error);
    process.exit(1);
  }
}

testDatabaseConnection();