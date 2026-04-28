import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 过滤文本中的括号内容（神态动作描述）
 * 用于 TTS 语音合成前清理文本
 * @param text - 原始文本
 * @returns 清理后的文本
 */
export function cleanTextForTTS(text: string): string {
  return text
    .replace(/（[^）]*）/g, '') // 移除中文括号内容
    .replace(/\([^)]*\)/g, '') // 移除英文括号内容
    .trim();
}
