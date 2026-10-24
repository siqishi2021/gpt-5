"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CodeExample } from "@/lib/code-examples";
import { CopyButton } from "@/components/ui/copy-button";
import { 
  Shuffle, 
  Code, 
  Eye, 
  ExternalLink, 
  Check, 
  Copy,
  X
} from "lucide-react";
import Link from "next/link";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface AppModalProps {
  active: CodeExample | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: () => void;
}

export function AppModal({ active, open, onOpenChange }: AppModalProps) {
  const [showSourceCode, setShowSourceCode] = React.useState(false);
  const [sourceCode, setSourceCode] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const iframePermissions = React.useMemo(() => {
    const perms = [
      active?.camera && "camera",
      active?.microphone && "microphone",
    ].filter(Boolean);
    return perms.length > 0 ? perms.join("; ") : undefined;
  }, [active]);

  const fetchSourceCode = React.useCallback(async () => {
    if (!active) return;
    
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoading(true);
    try {
      const response = await fetch(active.iframeUrl, {
        signal: controller.signal,
        cache: 'force-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      if (!controller.signal.aborted) {
        setSourceCode(html);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.error("获取源码失败:", error);
      setSourceCode("<!-- ❌ 无法加载源码\n// 可能原因：跨域限制、网络问题或目标站点限制 -->");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [active]);

  const toggleSourceCode = React.useCallback(() => {
    if (!showSourceCode && !sourceCode && !isLoading) {
      fetchSourceCode();
    }
    setShowSourceCode(!showSourceCode);
  }, [showSourceCode, sourceCode, isLoading, fetchSourceCode]);

  const copySourceCode = React.useCallback(async () => {
    if (!sourceCode) return;
    
    try {
      await navigator.clipboard?.writeText(sourceCode);
      setCopied(true);
      
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  }, [sourceCode]);

  React.useEffect(() => {
    setShowSourceCode(false);
    setSourceCode(null);
    setIsLoading(false);
    setCopied(false);
    abortControllerRef.current?.abort();
  }, [active]);

  if (!active) return null;

  // 桌面端布局（保持原样）
  const DesktopLayout = () => (
    <div className="flex w-full h-full flex-col-reverse gap-6 md:flex-row overflow-hidden min-h-0">
      <div className="flex w-full flex-col md:w-2/3 overflow-hidden min-h-0">
        {showSourceCode ? (
          <div className="flex-1 w-full rounded border overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b shrink-0">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Code size={16} />
                HTML 源代码
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={copySourceCode}
                  className="p-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-600" />
                      <span className="text-green-600 text-xs">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="text-xs">复制</span>
                    </>
                  )}
                </button>
                <button
                  onClick={toggleSourceCode}
                  className="p-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
                >
                  <Eye size={14} />
                  <span className="text-xs">预览</span>
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 text-sm">加载源码中...</span>
                </div>
              </div>
            ) : (
              <pre className="flex-1 overflow-auto p-4 text-sm font-mono bg-gray-50 whitespace-pre-wrap break-all">
                <code>{sourceCode}</code>
              </pre>
            )}
          </div>
        ) : (
          <div className="flex-1 w-full rounded border overflow-hidden bg-white">
            <iframe
              src={active.iframeUrl}
              title={`${active.title} 演示`}
              className="h-full w-full"
              allow={iframePermissions}
            />
          </div>
        )}
      </div>

      <div className="flex w-full min-h-0 flex-col gap-3 md:w-1/3">
        <div className="flex flex-col items-center justify-center w-full h-full box-border pt-4 md:pt-0 overflow-hidden">
          <div className="flex flex-col items-center justify-between mb-4 shrink-0">
            <DialogTitle className="text-2xl font-semibold leading-tight flex items-center gap-2">
              {active.title}
            </DialogTitle>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <Link
                href={active.iframeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700 transition-colors duration-100 px-3 py-1.5 rounded-md hover:bg-gray-100 border border-gray-200"
              >
                <ExternalLink size={14} />
                新窗口打开
              </Link>

              <button
                onClick={toggleSourceCode}
                className="inline-flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700 transition-colors duration-100 px-3 py-1.5 rounded-md hover:bg-gray-100 border border-gray-200"
              >
                <Code size={14} />
                {showSourceCode ? "查看预览" : "查看源码"}
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-5 md:justify-start">
              <Link
                href={`https://chatgpt.com/?model=gpt-5&prompt=${encodeURIComponent(
                  active.prompt
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity"
              >
                <Shuffle size={16} />
                在 ChatGPT 中打开
              </Link>
              <CopyButton copyValue={() => active.prompt} />
            </div>
          </div>

          <div className="px-4 py-6 w-full min-h-0 flex-1 flex flex-col">
            <div className="text-sm text-gray-900 font-medium mb-2 flex items-center gap-2 shrink-0">
              📝 生成提示词:
            </div>
            <div className="relative overflow-auto min-h-0 flex-1">
              <div className="whitespace-pre-wrap break-words font-mono text-sm p-3 bg-gray-50 rounded-lg border border-gray-200">
                {active.prompt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 移动端布局
  const MobileLayout = () => (
    <div className="flex flex-col h-full bg-white">
      {/* ✅ 隐藏的 DialogTitle 满足无障碍要求 */}
      <VisuallyHidden asChild>
        <DialogTitle>{active.title}</DialogTitle>
      </VisuallyHidden>

      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="关闭"
          >
            <X size={20} className="text-gray-700" />
          </button>
          <span className="text-base font-semibold text-gray-900 truncate">
            {active.title}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleSourceCode}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={showSourceCode ? "查看预览" : "查看源码"}
          >
            {showSourceCode ? (
              <Eye size={18} className="text-gray-700" />
            ) : (
              <Code size={18} className="text-gray-700" />
            )}
          </button>
          {showSourceCode && (
            <button
              onClick={copySourceCode}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="复制源码"
            >
              {copied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-gray-700" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 bg-white">
          {showSourceCode ? (
            isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 text-sm">加载源码中...</span>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                  <code>{sourceCode}</code>
                </pre>
              </div>
            )
          ) : (
            <iframe
              src={active.iframeUrl}
              title={`${active.title} 演示`}
              className="h-full w-full border-0"
              allow={iframePermissions}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>

        <div className="bg-white border-t px-4 py-3">
          <div className="flex flex-wrap gap-2 mb-3">
            <Link
              href={active.iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <ExternalLink size={13} />
              新窗口打开
            </Link>
            
            <Link
              href={`https://chatgpt.com/?model=gpt-5&prompt=${encodeURIComponent(
                active.prompt
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 rounded-lg"
            >
              <Shuffle size={13} />
              在 ChatGPT 中打开
            </Link>

            <CopyButton copyValue={() => active.prompt} />
          </div>

          <div className="text-xs font-semibold text-gray-500 mb-1.5">📝 生成提示词</div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-gray-700">
              {active.prompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`
        ${isMobile 
          ? 'h-[100dvh] w-full p-0 overflow-hidden rounded-none border-0 shadow-none [&>button]:hidden'
          : 'h-[90vh] w-full md:min-w-[80vw] md:h-[80vh] p-4 overflow-hidden'
        }
      `}>
        {active && (
          isMobile ? <MobileLayout /> : <DesktopLayout />
        )}
      </DialogContent>
    </Dialog>
  );
}