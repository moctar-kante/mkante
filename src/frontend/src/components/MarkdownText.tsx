import type React from "react";

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownText({ content, className = "" }: Props) {
  const paragraphs = content.split(/\n{2,}/);

  function renderInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(<strong key={keyIdx++}>{boldMatch[2]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      const italicMatch = remaining.match(/^(.*?)\*(.+?)\*/);
      if (italicMatch) {
        if (italicMatch[1]) parts.push(italicMatch[1]);
        parts.push(<em key={keyIdx++}>{italicMatch[2]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }
      const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)/);
      if (linkMatch) {
        if (linkMatch[1]) parts.push(linkMatch[1]);
        parts.push(
          <a
            key={keyIdx++}
            href={linkMatch[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {linkMatch[2]}
          </a>,
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }
      parts.push(remaining);
      remaining = "";
    }
    return parts;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;
        const paraKey = `p-${i}-${trimmed.slice(0, 8)}`;
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={paraKey}
              className="font-serif text-xl font-normal mt-6 mb-2"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={paraKey}
              className="font-serif text-2xl font-normal mt-6 mb-2"
            >
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.match(/^[-*] /));
          return (
            <ul key={paraKey} className="list-disc list-inside space-y-1">
              {items.map((item) => (
                <li key={item} className="text-foreground">
                  {renderInline(item.slice(2))}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={paraKey} className="text-foreground leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
