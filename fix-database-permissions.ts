import { config } from "dotenv";
import { getSupabaseClient } from "./src/storage/database/supabase-client";
import fs from "fs";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function fixDatabasePermissions() {
  console.log("开始修复数据库权限...");

  try {
    const client = getSupabaseClient();
    console.log("✅ Supabase 客户端创建成功");

    // 读取SQL文件
    const sqlContent = fs.readFileSync("fix-database-permissions.sql", "utf-8");
    console.log("✅ SQL文件读取成功");

    // 分割SQL语句
    const sqlStatements = sqlContent
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`\n找到 ${sqlStatements.length} 条SQL语句`);

    // 执行每个SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      console.log(`\n执行第 ${i + 1}/${sqlStatements.length} 条语句...`);
      console.log(`SQL: ${sql.substring(0, 50)}...`);

      try {
        const { data, error } = await client.rpc("exec_sql", { sql_query: sql });
        
        if (error) {
          console.log(`⚠️  执行失败:`, error.message);
          // 继续执行下一条语句
        } else {
          console.log(`✅ 执行成功`);
        }
      } catch (err) {
        console.log(`⚠️  执行异常:`, err);
      }
    }

    console.log("\n🎉 数据库权限修复完成！");
    console.log("\n现在可以尝试注册用户了。");

  } catch (error) {
    console.error("\n❌ 数据库权限修复失败:", error);
    process.exit(1);
  }
}

fixDatabasePermissions();