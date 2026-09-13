import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn 样式类名合并辅助工具方法
 * shadcn className merge utility helper function
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
