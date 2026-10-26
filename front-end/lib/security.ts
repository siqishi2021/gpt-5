const ALLOWED_IFRAME_HOSTS = new Set<string>([
  // 你的课程站域名；本地开发时同源相对路径单独处理
  "open.maic.chat",
]);

export function isAllowedIframeUrl(value: string): boolean {
  if (!value) return false;
  // 允许站内相对路径（例如 /some-slug）
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_IFRAME_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}