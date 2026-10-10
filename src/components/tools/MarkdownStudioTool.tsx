import React, { useState } from "react";
import { Copy, Check, Download, Bold, Italic, Heading, Link as LinkIcon, Code, List, Quote, FileDown } from "lucide-react";

export const MarkdownStudioTool: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(`# 마크다운 라이브 스튜디오

이 도구는 **실시간 미리보기**와 *HTML 추출*, *.md 파일 다운로드*를 지원합니다.

## 주요 기능
- 실시간 서식 반영
- 깔끔한 코드 블록 하이라이팅
- 원클릭 HTML 변환 및 복사

### 코드 예제
\`\`\`javascript
const message = "Hello OmniTools!";
console.log(message);
\`\`\`

> "단순함이 궁극의 정교함이다." - 레오나르도 다 빈치

### 지원되는 서식
| 구분 | 기능 | 상태 |
| --- | --- | --- |
| 서식 | 볼드, 이탤릭 | 지원됨 |
| 목록 | 순서 있는/없는 목록 | 지원됨 |
| 링크 | [OmniTools 홈](#) | 활성화 |
`);

  const [copiedHtml, setCopiedHtml] = useState(false);

  // Markdown to simple HTML converter
  const parseMarkdownToHtml = (md: string) => {
    let html = md
      // Escape
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg my-3 overflow-x-auto font-mono text-xs"><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-800 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-200">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-slate-900 mt-2 mb-3 pb-1 border-b-2 border-indigo-200">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-slate-600 italic bg-indigo-50/40 rounded-r">$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline font-medium" target="_blank" rel="noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc my-0.5 text-slate-700">$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '<p class="my-2 text-slate-700 leading-relaxed"></p>');

    return html;
  };

  const htmlOutput = parseMarkdownToHtml(markdown);

  const insertSyntax = (syntaxPrefix: string, syntaxSuffix: string = "") => {
    const textarea = document.getElementById("md-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || "텍스트";
    const replacement = `${syntaxPrefix}${selectedText}${syntaxSuffix}`;
    const newText = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(newText);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => insertSyntax("# ", "")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
            title="제목 1"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSyntax("**", "**")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold"
            title="굵게"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSyntax("*", "*")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs italic"
            title="기울임"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSyntax("- ", "")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
            title="목록"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSyntax("> ", "")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
            title="인용구"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSyntax("```javascript\n", "\n```")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-mono"
            title="코드 블록"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertSyntax("[링크이름](", ")")}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
            title="하이퍼링크"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-html-btn"
            onClick={handleCopyHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHtml ? "HTML 복사됨" : "HTML 복사"}</span>
          </button>
          <button
            id="download-md-btn"
            onClick={handleDownloadMd}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>.md 파일 저장</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
            마크다운 소스 편집기
          </div>
          <textarea
            id="md-editor-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={18}
            className="w-full p-4 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none resize-none flex-1"
            placeholder="마크다운 문법을 자유롭게 입력하세요..."
          />
        </div>

        {/* Live Preview */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 flex justify-between">
            <span>실시간 렌더링 미리보기</span>
            <span className="text-[11px] text-emerald-600 font-medium">동기화 활성화</span>
          </div>
          <div
            className="p-4 overflow-y-auto max-h-[460px] text-sm leading-relaxed prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        </div>
      </div>
    </div>
  );
};
