"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CodeExample } from "@/lib/code-examples";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Shuffle,
  Code,
  Eye,
  ExternalLink,
  Check,
  Copy,
  X,
} from "lucide-react";
import Link from "next/link";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { isAllowedIframeUrl } from "@/lib/iframe-security";

const CHATGPT_MODEL = "gpt-5";

interface AppModalProps {
  active: CodeExample | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: () => void;
}

export function AppModal({
  active,
  open,
  onOpenChange,
}: AppModalProps) {
  const [showSourceCode, setShowSourceCode] =
    React.useState(false);

  const [sourceCode, setSourceCode] =
    React.useState<string | null>(null);

  const [isLoading, setIsLoading] =
    React.useState(false);

  const [copied, setCopied] =
    React.useState(false);

  const [isMobile, setIsMobile] =
    React.useState(false);

  const [iframeLoaded, setIframeLoaded] =
    React.useState(false);

  const [iframeLoading, setIframeLoading] =
    React.useState(true);

  const abortControllerRef =
    React.useRef<AbortController | null>(null);

  const copyTimeoutRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
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
    if (!active) return undefined;

    const permissions: string[] = [];

    if (active.camera) {
      permissions.push("camera");
    }

    if (active.microphone) {
      permissions.push("microphone");
    }

    return permissions.length
      ? permissions.join("; ")
      : undefined;
  }, [active]);

  const iframeAllowed = React.useMemo(() => {
    if (!active) return false;

    return isAllowedIframeUrl(
      active.iframeUrl
    );
  }, [active]);

  const chatGPTUrl = React.useMemo(() => {
    if (!active) {
      return "https://chatgpt.com/";
    }

    const params = new URLSearchParams({
      model: CHATGPT_MODEL,
      prompt: active.prompt,
    });

    return `https://chatgpt.com/?${params.toString()}`;
  }, [active]);

  const fetchSourceCode =
    React.useCallback(async () => {
      if (!active || !iframeAllowed) {
        return;
      }

      abortControllerRef.current?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      setIsLoading(true);

      try {
        const response = await fetch(
          active.iframeUrl,
          {
            signal: controller.signal,
            cache: "force-cache",
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const html =
          await response.text();

        if (!controller.signal.aborted) {
          setSourceCode(html);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Failed to fetch source code:",
          error
        );

        setSourceCode(
          `<!-- ❌ Unable to load source code

// Possible reasons:
// 1. CORS restrictions
// 2. Network issues
// 3. Target site forbids cross-origin reads
// 4. Target site blocks source access
-->`
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, [active, iframeAllowed]);

  const toggleSourceCode =
    React.useCallback(() => {
      if (
        !showSourceCode &&
        !sourceCode &&
        !isLoading
      ) {
        void fetchSourceCode();
      }

      setShowSourceCode(
        (value) => !value
      );
    }, [
      showSourceCode,
      sourceCode,
      isLoading,
      fetchSourceCode,
    ]);

  const copySourceCode =
    React.useCallback(async () => {
      if (!sourceCode) return;

      try {
        await navigator.clipboard.writeText(
          sourceCode
        );

        setCopied(true);

        if (copyTimeoutRef.current) {
          clearTimeout(
            copyTimeoutRef.current
          );
        }

        copyTimeoutRef.current =
          setTimeout(() => {
            setCopied(false);
          }, 2000);
      } catch (error) {
        console.error(
          "Copy failed:",
          error
        );
      }
    }, [sourceCode]);

  React.useEffect(() => {
    abortControllerRef.current?.abort();

    setShowSourceCode(false);
    setSourceCode(null);
    setIsLoading(false);
    setCopied(false);

    setIframeLoaded(false);
    setIframeLoading(true);
  }, [active, open]);

  const loadIframe =
    React.useCallback(() => {
      setIframeLoading(true);
      setIframeLoaded(true);
    }, []);

  if (!active) {
    return null;
  }

  const renderPreview = (
    className: string
  ) => {
    if (showSourceCode) {
      if (isLoading) {
        return (
          <div
            className={`${className} flex items-center justify-center`}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="
                  h-6 w-6 animate-spin
                  rounded-full border-2
                  border-blue-500
                  border-t-transparent
                "
              />
              <span className="text-sm text-gray-500">
                Loading source code...
              </span>
            </div>
          </div>
        );
      }

      return (
        <pre
          className={`
            ${className}
            overflow-auto
            bg-gray-50 p-4
            text-sm font-mono
            whitespace-pre-wrap
            break-all
          `}
        >
          <code>
            {sourceCode}
          </code>
        </pre>
      );
    }

    if (!iframeAllowed) {
      return (
        <div
          className={`
            ${className}
            flex items-center justify-center
            bg-muted/30
          `}
        >
          <div className="px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Unable to load this course
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              The domain of this course is not in the whitelist
            </p>
          </div>
        </div>
      );
    }

    if (!iframeLoaded) {
      return (
        <div
          className={`
            ${className}
            flex items-center justify-center
            bg-muted/30
          `}
        >
          <div className="flex max-w-sm flex-col items-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-primary/10 p-4">
              <Eye className="h-8 w-8 text-primary" />
            </div>

            <h3 className="text-lg font-semibold">
              Course Preview
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              This course page is large. Click below to load it and significantly reduce the waiting time for the homepage and the modal.
            </p>

            <button
              type="button"
              onClick={loadIframe}
              className="
                mt-5 rounded-lg
                bg-primary
                px-5 py-2.5
                text-sm font-medium
                text-primary-foreground
                transition-opacity
                hover:opacity-90
              "
            >
              Load Course Content
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${className} relative`}
      >
        {iframeLoading && (
          <div
            className="
              absolute inset-0 z-10
              flex items-center justify-center
              bg-white/80
            "
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="
                  h-6 w-6 animate-spin
                  rounded-full border-2
                  border-blue-500
                  border-t-transparent
                "
              />

              <span className="text-sm text-gray-500">
                Loading course...
              </span>
            </div>
          </div>
        )}

        <iframe
          src={active.iframeUrl}
          title={`${active.title} demo`}
          className="h-full w-full border-0"
          allow={iframePermissions}
          sandbox="
            allow-scripts
            allow-same-origin
            allow-forms
            allow-popups
          "
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() =>
            setIframeLoading(false)
          }
        />
      </div>
    );
  };

  const DesktopLayout =
    () => (
      <div
        className="
          flex h-full w-full
          min-h-0
          flex-col-reverse
          gap-6
          overflow-hidden
          md:flex-row
        "
      >
        <div
          className="
            flex min-h-0
            w-full flex-col
            overflow-hidden
            md:w-2/3
          "
        >
          <div
            className="
              min-h-0 flex-1
              w-full
              overflow-hidden
              rounded border
              bg-white
            "
          >
            {renderPreview(
              "h-full w-full"
            )}
          </div>

          <div className="mt-2 flex gap-2">
            {showSourceCode ? (
              <>
                <button
                  type="button"
                  onClick={
                    toggleSourceCode
                  }
                  className="
                    inline-flex
                    items-center gap-1.5
                    rounded-md
                    border border-gray-200
                    px-3 py-1.5
                    text-sm text-gray-500
                    transition-colors
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                >
                  <Eye size={14} />
                  View Preview
                </button>

                <button
                  type="button"
                  onClick={
                    copySourceCode
                  }
                  className="
                    inline-flex
                    items-center gap-1.5
                    rounded-md
                    border border-gray-200
                    px-3 py-1.5
                    text-sm text-gray-500
                    transition-colors
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                >
                  {copied ? (
                    <Check
                      size={14}
                      className="text-green-600"
                    />
                  ) : (
                    <Copy size={14} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy Source"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={
                  toggleSourceCode
                }
                className="
                  inline-flex
                  items-center gap-1.5
                  rounded-md
                  border border-gray-200
                  px-3 py-1.5
                  text-sm text-gray-500
                  transition-colors
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >
                <Code size={14} />
                View Source
              </button>
            )}
          </div>
        </div>

        <div
          className="
            flex min-h-0
            w-full flex-col gap-3
            md:w-1/3
          "
        >
          <div
            className="
              box-border
              flex h-full min-h-0
              flex-col items-center
              justify-center
              overflow-hidden
              pt-4
              md:pt-0
            "
          >
            <div
              className="
                mb-4 flex shrink-0
                flex-col items-center
                justify-between
              "
            >
              <DialogTitle
                className="
                  flex items-center gap-2
                  text-2xl font-semibold
                  leading-tight
                "
              >
                {active.title}
              </DialogTitle>

              <div
                className="
                  mt-3 flex flex-wrap
                  items-center justify-center
                  gap-2
                "
              >
                <Link
                  href={
                    active.iframeUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center gap-1.5
                    rounded-md
                    border border-gray-200
                    px-3 py-1.5
                    text-sm text-gray-500
                    transition-colors
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                >
                  <ExternalLink
                    size={14}
                  />
                  Open in New Window
                </Link>
              </div>

              <div
                className="
                  mt-5 flex
                  justify-center gap-2
                  md:justify-start
                "
              >
                <Link
                  href={chatGPTUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center gap-2
                    rounded-lg
                    bg-gradient-to-r
                    from-blue-500
                    to-purple-600
                    px-3 py-1.5
                    text-sm text-white
                    transition-opacity
                    hover:opacity-90
                  "
                >
                  <Shuffle size={16} />
                  Open in ChatGPT
                </Link>

                <CopyButton
                  copyValue={() =>
                    active.prompt
                  }
                />
              </div>
            </div>

            <div
              className="
                flex min-h-0
                w-full flex-1
                flex-col
                px-4 py-6
              "
            >
              <div
                className="
                  mb-2 flex shrink-0
                  items-center gap-2
                  text-sm font-medium
                  text-gray-900
                "
              >
                📝 Generation Prompt:
              </div>

              <div className="relative min-h-0 flex-1 overflow-auto">
                <div
                  className="
                    rounded-lg
                    border border-gray-200
                    bg-gray-50
                    p-3
                    font-mono text-sm
                    whitespace-pre-wrap
                    break-words
                  "
                >
                  {active.prompt}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const MobileLayout =
    () => (
      <div className="flex h-full flex-col bg-white">
        <VisuallyHidden asChild>
          <DialogTitle>
            {active.title}
          </DialogTitle>
        </VisuallyHidden>

        <div
          className="
            flex shrink-0
            items-center justify-between
            border-b bg-white
            px-4 py-3
          "
        >
          <div
            className="
              flex min-w-0
              flex-1 items-center gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                onOpenChange(false)
              }
              className="
                -ml-1.5 shrink-0
                rounded-full
                p-1.5
                transition-colors
                hover:bg-gray-100
              "
              aria-label="Close"
            >
              <X
                size={20}
                className="text-gray-700"
              />
            </button>

            <span
              className="
                truncate
                text-base font-semibold
                text-gray-900
              "
            >
              {active.title}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={
                toggleSourceCode
              }
              className="
                rounded-full
                p-2
                transition-colors
                hover:bg-gray-100
              "
              aria-label={
                showSourceCode
                  ? "View Preview"
                  : "View Source"
              }
            >
              {showSourceCode ? (
                <Eye
                  size={18}
                  className="text-gray-700"
                />
              ) : (
                <Code
                  size={18}
                  className="text-gray-700"
                />
              )}
            </button>

            {showSourceCode && (
              <button
                type="button"
                onClick={
                  copySourceCode
                }
                className="
                  rounded-full
                  p-2
                  transition-colors
                  hover:bg-gray-100
                "
                aria-label="Copy Source"
              >
                {copied ? (
                  <Check
                    size={18}
                    className="text-green-600"
                  />
                ) : (
                  <Copy
                    size={18}
                    className="text-gray-700"
                  />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 bg-white">
            {renderPreview(
              "h-full w-full"
            )}
          </div>

          <div
            className="
              border-t
              bg-white
              px-4 py-3
            "
          >
            <div
              className="
                mb-3 flex flex-wrap gap-2
              "
            >
              <Link
                href={
                  active.iframeUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  items-center gap-1.5
                  rounded-lg
                  bg-gray-100
                  px-3 py-2
                  text-xs font-medium
                  text-gray-700
                  transition-colors
                  hover:bg-gray-200
                "
              >
                <ExternalLink
                  size={13}
                />
                Open in New Window
              </Link>

              <Link
                href={chatGPTUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  items-center gap-1.5
                  rounded-lg
                  bg-gradient-to-r
                  from-blue-500
                  to-purple-600
                  px-3 py-2
                  text-xs font-medium
                  text-white
                "
              >
                <Shuffle size={13} />
                Open in ChatGPT
              </Link>

              <CopyButton
                copyValue={() =>
                  active.prompt
                }
              />
            </div>

            <div
              className="
                mb-1.5
                text-xs font-semibold
                text-gray-500
              "
            >
              📝 Generation Prompt
            </div>

            <div
              className="
                max-h-32
                overflow-y-auto
                rounded-lg
                border border-gray-100
                bg-gray-50 p-3
              "
            >
              <pre
                className="
                  whitespace-pre-wrap
                  break-words
                  font-mono
                  text-xs text-gray-700
                "
              >
                {active.prompt}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={
          isMobile
            ? `
              h-[100dvh] w-full
              rounded-none
              border-0
              p-0
              shadow-none
              overflow-hidden
              [&>button]:hidden
            `
            : `
              h-[90vh] w-full
              overflow-hidden
              p-4
              md:h-[80vh]
              md:min-w-[80vw]
            `
        }
      >
        {isMobile
          ? <MobileLayout />
          : <DesktopLayout />}
      </DialogContent>
    </Dialog>
  );
}