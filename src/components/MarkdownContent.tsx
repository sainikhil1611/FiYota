import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  // Simple markdown parser that handles common formatting
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;
    let codeBlock = false;
    let codeLines: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
            {listItems.map((item, i) => (
              <li key={i} className="ml-2">{parseInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushCodeBlock = () => {
      if (codeLines.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-muted/50 rounded p-3 my-2 overflow-x-auto">
            <code className="text-xs font-mono">{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        codeBlock = false;
      }
    };

    const parseInline = (line: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let currentText = '';
      let i = 0;

      while (i < line.length) {
        // Bold: **text** or __text__
        if ((line[i] === '*' && line[i + 1] === '*') || (line[i] === '_' && line[i + 1] === '_')) {
          if (currentText) {
            parts.push(currentText);
            currentText = '';
          }
          const delimiter = line.slice(i, i + 2);
          const endIndex = line.indexOf(delimiter, i + 2);
          if (endIndex !== -1) {
            const boldText = line.slice(i + 2, endIndex);
            parts.push(<strong key={i} className="font-semibold">{boldText}</strong>);
            i = endIndex + 2;
            continue;
          }
        }

        // Italic: *text* or _text_
        if (line[i] === '*' || line[i] === '_') {
          if (currentText) {
            parts.push(currentText);
            currentText = '';
          }
          const delimiter = line[i];
          const endIndex = line.indexOf(delimiter, i + 1);
          if (endIndex !== -1 && line[endIndex + 1] !== delimiter) {
            const italicText = line.slice(i + 1, endIndex);
            parts.push(<em key={i} className="italic">{italicText}</em>);
            i = endIndex + 1;
            continue;
          }
        }

        // Inline code: `text`
        if (line[i] === '`') {
          if (currentText) {
            parts.push(currentText);
            currentText = '';
          }
          const endIndex = line.indexOf('`', i + 1);
          if (endIndex !== -1) {
            const codeText = line.slice(i + 1, endIndex);
            parts.push(
              <code key={i} className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono">
                {codeText}
              </code>
            );
            i = endIndex + 1;
            continue;
          }
        }

        currentText += line[i];
        i++;
      }

      if (currentText) {
        parts.push(currentText);
      }

      return parts.length > 0 ? parts : [line];
    };

    lines.forEach((line, index) => {
      // Code blocks: ```
      if (line.trim().startsWith('```')) {
        if (codeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          codeBlock = true;
        }
        return;
      }

      if (codeBlock) {
        codeLines.push(line);
        return;
      }

      // Headings: ## or ###
      if (line.startsWith('###')) {
        flushList();
        elements.push(
          <h3 key={index} className="font-semibold text-base mt-3 mb-1">
            {parseInline(line.replace(/^###\s*/, ''))}
          </h3>
        );
        return;
      }

      if (line.startsWith('##')) {
        flushList();
        elements.push(
          <h2 key={index} className="font-bold text-lg mt-4 mb-2">
            {parseInline(line.replace(/^##\s*/, ''))}
          </h2>
        );
        return;
      }

      if (line.startsWith('#')) {
        flushList();
        elements.push(
          <h1 key={index} className="font-bold text-xl mt-4 mb-2">
            {parseInline(line.replace(/^#\s*/, ''))}
          </h1>
        );
        return;
      }

      // Bullet lists: - or *
      if (line.trim().match(/^[-*]\s+/)) {
        const item = line.trim().replace(/^[-*]\s+/, '');
        listItems.push(item);
        inList = true;
        return;
      }

      // Numbered lists: 1. 2. etc
      if (line.trim().match(/^\d+\.\s+/)) {
        flushList();
        const item = line.trim().replace(/^\d+\.\s+/, '');
        if (!inList) {
          inList = true;
        }
        listItems.push(item);
        return;
      }

      // Regular line
      if (inList && line.trim() === '') {
        flushList();
        return;
      }

      if (line.trim() === '') {
        flushList();
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      flushList();
      elements.push(
        <p key={index} className="my-1">
          {parseInline(line)}
        </p>
      );
    });

    flushList();
    flushCodeBlock();

    return elements;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
}
