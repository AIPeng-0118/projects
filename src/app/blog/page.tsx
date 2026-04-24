"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  created_at: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPosts(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex flex-col">
        <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
          <button onClick={() => router.push("/")} className="text-lg">
            ←
          </button>
          <span className="font-medium flex-1 text-center">恋爱攻略</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#666666]">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex flex-col">
        <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
          <button onClick={() => router.push("/")} className="text-lg">
            ←
          </button>
          <span className="font-medium flex-1 text-center">恋爱攻略</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#E91E63]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格顶部 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push("/")} className="text-lg">
          ←
        </button>
        <span className="font-medium flex-1 text-center">恋爱攻略</span>
        <span className="text-sm opacity-50">{posts.length}篇</span>
      </div>

      {/* 文章列表 */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => router.push(`/blog/${post.id}`)}
              className="w-full bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              {/* 标题 */}
              <h2 className="text-[#1A1A1A] font-medium text-lg leading-snug mb-2">
                {post.title}
              </h2>

              {/* 摘要 */}
              <p className="text-[#666666] text-sm leading-relaxed mb-3">
                {post.summary}
              </p>

              {/* 底部信息 */}
              <div className="flex items-center justify-between text-xs text-[#999999]">
                <span>{formatDate(post.created_at)}</span>
                <span>点击阅读 →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="bg-[#F7F7F7] border-t border-[#E0E0E0] px-4 py-3">
        <p className="text-center text-xs text-[#CCCCCC]">
          更多攻略持续更新中...
        </p>
      </div>
    </div>
  );
}
