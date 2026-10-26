const ALLOWED_IFRAME_HOSTS = new Set<string>([
  "open.maic.chat",
]);

// 你的课程 iframeUrl 是 /slug 形式，必须放行根路径
const ALLOWED_LOCAL_PREFIXES: string[] = ["/"];

export function isAllowedIframeUrl(value: string): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return ALLOWED_LOCAL_PREFIXES.some((prefix) =>
      trimmed.startsWith(prefix)
    );
  }

  try {
    const url = new URL(trimmed);
    return (
      url.protocol === "https:" &&
      ALLOWED_IFRAME_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}