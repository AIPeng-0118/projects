"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证密码确认
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // 注册成功，保存登录状态并跳转
        localStorage.setItem("user", JSON.stringify(data.data));
        router.push("/");
        router.refresh();
      } else {
        setError(data.error);
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格顶部 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push("/")} className="text-lg">
          ←
        </button>
        <span className="font-medium flex-1 text-center">注册</span>
      </div>

      {/* 注册表单 */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 text-center">
            创建账号
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="block text-sm text-[#666666] mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3-20个字符"
                className="w-full px-4 py-3 bg-[#F7F7F7] rounded-lg text-[#1A1A1A] placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#07C160]"
                maxLength={20}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm text-[#666666] mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6个字符"
                className="w-full px-4 py-3 bg-[#F7F7F7] rounded-lg text-[#1A1A1A] placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#07C160]"
                minLength={6}
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm text-[#666666] mb-1">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再输一次密码"
                className="w-full px-4 py-3 bg-[#F7F7F7] rounded-lg text-[#1A1A1A] placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#07C160]"
                minLength={6}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-[#FFEBEE] text-[#C62828] rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full font-medium transition-all ${
                loading
                  ? "bg-[#CCCCCC] text-white cursor-not-allowed"
                  : "bg-[#07C160] text-white hover:bg-[#06a050] active:scale-[0.98]"
              }`}
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          {/* 登录链接 */}
          <p className="text-center text-sm text-[#666666] mt-6">
            已有账号？{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-[#07C160] hover:underline"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
