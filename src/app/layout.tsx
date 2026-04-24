import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器',
    template: '%s | 哄哄模拟器',
  },
  description:
    'AI扮演正在生气的对象，你需要在10轮内通过选择题把它哄好。情侣吵架后不知道怎么哄对方？来试试这个有趣的模拟器！',
  keywords: [
    '哄哄模拟器',
    '情侣吵架',
    '模拟器',
    '哄人',
    '道歉模拟器',
    'Coze Code',
    '扣子编程',
    'AI 编程',
  ],
  authors: [{ name: 'Coze Code Team', url: 'https://code.coze.cn' }],
  generator: 'Coze Code',
  openGraph: {
    title: '哄哄模拟器 | 你的AI工程师已就位',
    description: 'AI扮演正在生气的对象，你需要在10轮内通过选择题把它哄好。',
    url: 'https://code.coze.cn',
    siteName: '哄哄模拟器',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
