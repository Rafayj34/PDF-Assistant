"use client";

import { useMemo } from "react";
import React from "react";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Split content by code blocks first
    const parts: React.ReactNode[] = [];
    
    // Match code blocks (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let codeMatch;
    let lastIndex = 0;

    while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (codeMatch.index > lastIndex) {
        const textBefore = content.slice(lastIndex, codeMatch.index);
        const rendered = renderTextMarkdown(textBefore);
        if (rendered) {
          parts.push(
            <React.Fragment key={`text-before-${codeMatch.index}`}>
              {rendered}
            </React.Fragment>
          );
        }
      }

      // Add code block
      const language = codeMatch[1] || "text";
      const code = codeMatch[2];
      parts.push(
        <pre
          key={`code-${codeMatch.index}`}
          className="bg-slate-900 dark:bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-2 text-xs font-mono border border-slate-700"
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remaining = renderTextMarkdown(content.slice(lastIndex));
      if (remaining) {
        parts.push(
          <React.Fragment key={`text-remaining-${lastIndex}`}>
            {remaining}
          </React.Fragment>
        );
      }
    }

    return parts.length > 0 ? (
      <React.Fragment key="markdown-main">{parts}</React.Fragment>
    ) : (
      renderTextMarkdown(content)
    );
  }, [content]);

  return <div className="markdown-content">{renderedContent}</div>;
};

function renderTextMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyCounter = 0;

  // Match inline code (`code`)
  const inlineCodeRegex = /`([^`]+)`/g;
  let match;

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before inline code
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      const rendered = renderTextElements(textBefore, keyCounter);
      if (rendered) {
        parts.push(
          <React.Fragment key={`text-inline-${keyCounter}`}>
            {rendered}
          </React.Fragment>
        );
      }
      keyCounter += (textBefore.match(/\*\*/g) || []).length;
    }

    // Add inline code
    parts.push(
      <code
        key={`inline-code-${keyCounter++}`}
        className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded text-xs font-mono"
      >
        {match[1]}
      </code>
    );

    lastIndex = inlineCodeRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = renderTextElements(text.slice(lastIndex), keyCounter);
    if (remaining) {
      parts.push(
        <React.Fragment key={`text-remaining-${keyCounter}`}>
          {remaining}
        </React.Fragment>
      );
    }
  }

  return parts.length > 0 ? (
    <React.Fragment key={`markdown-text-${keyCounter}`}>{parts}</React.Fragment>
  ) : (
    renderTextElements(text, 0)
  );
}

function renderTextElements(text: string, startKey: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let keyCounter = startKey;
  let lastIndex = 0;

  // Match bold (**text**)
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      const lines = textBefore.split("\n");
      lines.forEach((line, idx) => {
        if (idx > 0) parts.push(<br key={`br-${keyCounter++}`} />);
        // Check for headers
        if (line.startsWith("### ")) {
          parts.push(
            <h3 key={`h3-${keyCounter++}`} className="text-base font-semibold mt-4 mb-2">
              {line.slice(4)}
            </h3>
          );
        } else if (line.startsWith("## ")) {
          parts.push(
            <h2 key={`h2-${keyCounter++}`} className="text-lg font-semibold mt-4 mb-2">
              {line.slice(3)}
            </h2>
          );
        } else if (line.startsWith("# ")) {
          parts.push(
            <h1 key={`h1-${keyCounter++}`} className="text-xl font-bold mt-4 mb-2">
              {line.slice(2)}
            </h1>
          );
        } else if (line.trim() === "---") {
          parts.push(<hr key={`hr-${keyCounter++}`} className="my-4 border-border" />);
        } else if (line.trim()) {
          parts.push(<span key={`text-${keyCounter++}`}>{line}</span>);
        }
      });
    }

    // Add bold text
    parts.push(
      <strong key={`bold-${keyCounter++}`} className="font-semibold">
        {match[1]}
      </strong>
    );

    lastIndex = boldRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    const lines = remaining.split("\n");
    lines.forEach((line, idx) => {
      if (idx > 0) parts.push(<br key={`br-${keyCounter++}`} />);
      // Check for headers
      if (line.startsWith("### ")) {
        parts.push(
          <h3 key={`h3-${keyCounter++}`} className="text-base font-semibold mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        parts.push(
          <h2 key={`h2-${keyCounter++}`} className="text-lg font-semibold mt-4 mb-2">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        parts.push(
          <h1 key={`h1-${keyCounter++}`} className="text-xl font-bold mt-4 mb-2">
            {line.slice(2)}
          </h1>
        );
      } else if (line.trim() === "---") {
        parts.push(<hr key={`hr-${keyCounter++}`} className="my-4 border-border" />);
      } else if (line.trim()) {
        parts.push(<span key={`text-${keyCounter++}`}>{line}</span>);
      }
    });
  }

  return parts.length > 0 ? (
    <React.Fragment key={`elements-${startKey}`}>{parts}</React.Fragment>
  ) : (
    <span key={`text-fallback-${startKey}`}>{text}</span>
  );
}

export default MarkdownRenderer;

