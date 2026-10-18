"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  if (!content) return null;

  // Split into blocks: code blocks, tables, blockquotes, lists, headings, paragraphs
  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-3 leading-relaxed text-sm ${className}`}>
      {blocks.map((block, i) => (
        <React.Fragment key={i}>{renderBlock(block, i)}</React.Fragment>
      ))}
    </div>
  );
}

type BlockType =
  | { type: "code"; lang: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "heading"; level: number; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string };

function parseBlocks(raw: string): BlockType[] {
  const lines = raw.split("\n");
  const blocks: BlockType[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    // Markdown Table: lines starting and containing |
    if (line.trim().startsWith("|") && line.trim().endsWith("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      const headerRow = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const cells = lines[i]
          .trim()
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        rows.push(cells);
        i++;
      }
      blocks.push({ type: "table", headers: headerRow, rows });
      continue;
    }

    // Heading: #, ##, ###
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Blockquote: > text
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join("\n") });
      continue;
    }

    // Unordered List: - item or * item
    if (line.trim().match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Ordered List: 1. item
    if (line.trim().match(/^\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Normal paragraph: gather contiguous lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().match(/^[-*]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/) &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|"))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join("\n") });
    }
  }

  return blocks;
}

function renderBlock(block: BlockType, key: number) {
  switch (block.type) {
    case "code":
      return <CodeBlock key={key} lang={block.lang} code={block.code} />;

    case "table":
      return (
        <div key={key} className="overflow-x-auto my-3 rounded-xl border border-white/10 glass">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {block.headers.map((h, hi) => (
                  <th key={hi} className="px-3.5 py-2.5 font-semibold text-text-primary">
                    <InlineText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {block.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3.5 py-2 text-text-secondary">
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "heading": {
      const cls =
        block.level === 1
          ? "text-xl font-bold text-text-primary mt-4 mb-2 border-b border-white/10 pb-1"
          : block.level === 2
          ? "text-lg font-bold text-text-primary mt-3 mb-1.5 flex items-center gap-2"
          : "text-base font-semibold text-text-primary mt-2 mb-1";
      return (
        <div key={key} className={cls}>
          <InlineText text={block.text} />
        </div>
      );
    }

    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-blue/60 bg-blue/5 rounded-r-xl px-4 py-2.5 text-text-secondary italic my-2"
        >
          <InlineText text={block.text} />
        </blockquote>
      );

    case "list":
      if (block.ordered) {
        return (
          <ol key={key} className="list-decimal list-inside space-y-1 my-1.5 pl-1 text-text-secondary">
            {block.items.map((it, idx) => (
              <li key={idx} className="leading-relaxed">
                <InlineText text={it} />
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={key} className="space-y-1.5 my-1.5 text-text-secondary">
          {block.items.map((it, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue mt-2 flex-shrink-0" />
              <div className="flex-1">
                <InlineText text={it} />
              </div>
            </li>
          ))}
        </ul>
      );

    case "paragraph":
      return (
        <p key={key} className="leading-relaxed text-text-secondary my-1">
          <InlineText text={block.text} />
        </p>
      );
  }
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-xs text-text-muted">
        <span className="font-mono uppercase">{lang || "code"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 hover:text-text-primary px-2 py-0.5 rounded transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono text-text-primary leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parses inline markdown: bold (**), italics (*), inline code (`), and markdown links ([text](url))
 */
function InlineText({ text }: { text: string }) {
  if (!text) return null;

  // Tokenize regex matching markdown links [text](url), inline code `code`, bold **bold**, italics *italic*
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const elements: React.ReactNode[] = [];

  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      elements.push(text.slice(lastIdx, match.index));
    }

    const fullMatch = match[0];

    // Markdown link: [text](url)
    if (fullMatch.startsWith("[") && match[2] && match[3]) {
      const linkText = match[2];
      const linkUrl = match[3];
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");

      if (isInternal) {
        elements.push(
          <Link
            key={match.index}
            href={linkUrl}
            className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
          >
            {linkText}
          </Link>
        );
      } else {
        elements.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
          >
            {linkText}
            <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }
    }
    // Inline code: `code`
    else if (fullMatch.startsWith("`") && match[4]) {
      elements.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-white/10 font-mono text-xs text-cyan-300"
        >
          {match[4]}
        </code>
      );
    }
    // Bold: **text**
    else if (fullMatch.startsWith("**") && match[5]) {
      elements.push(
        <strong key={match.index} className="font-semibold text-text-primary">
          {match[5]}
        </strong>
      );
    }
    // Italic: *text*
    else if (fullMatch.startsWith("*") && match[6]) {
      elements.push(
        <em key={match.index} className="italic">
          {match[6]}
        </em>
      );
    }

    lastIdx = pattern.lastIndex;
  }

  if (lastIdx < text.length) {
    elements.push(text.slice(lastIdx));
  }

  return <>{elements}</>;
}
