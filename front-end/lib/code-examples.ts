import path from "path";
import fs from "fs/promises";
import YAML from "yaml";
import { loadYamlFiles } from "./load-yaml";

export interface CodeExampleYAML {
  id?: string;
  title?: string;
  name?: string;
  prompt?: string;
  screenshot_url?: string;  // ✅ 添加这个字段
  tags?: unknown;
  camera?: unknown;
  microphone?: unknown;
}

export interface CodeExample {
  id: string;
  title: string;
  prompt: string;
  poster: string;
  iframeUrl: string;
  tags: string[];
  camera?: boolean;
  microphone?: boolean;
}

const CDN_BASE_URL = "https://cdn.openai.com/devhub/gpt5prompts";
const IFRAME_BASE_URL = "/";

function toStringArray(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value))
    return value.filter((v) => typeof v === "string") as string[];
  return undefined;
}

function toBool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export async function loadApps(): Promise<CodeExample[]> {
  const repoRoot = path.resolve(process.cwd(), "..");
  const files = await loadYamlFiles(repoRoot);
  const apps: CodeExample[] = [];

  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const obj = YAML.parse(raw) as CodeExampleYAML;

      const base = path.basename(file);
      const slug = base.replace(/\.(yaml|yml)$/i, "");

      const title = obj.title || obj.name || "";
      const prompt = obj.prompt || "";
      if (!title || !prompt) continue;

      // ✅ 优先使用 screenshot_url
      const poster = obj.screenshot_url 
        ? obj.screenshot_url 
        : `${CDN_BASE_URL}/${slug}.png`;

      apps.push({
        id: slug,
        title,
        prompt,
        poster,
        iframeUrl: `${IFRAME_BASE_URL}${slug}`,
        tags: toStringArray(obj.tags) ?? [],
        camera: toBool(obj.camera),
        microphone: toBool(obj.microphone),
      });
    } catch {
      // ignore malformed files
    }
  }

  apps.sort((a, b) => a.title.localeCompare(b.title));
  return apps;
}