import React, { useState } from "react";
import { Copy, Check, UploadCloud, FileText, Image as ImageIcon, ArrowDownUp, Trash2 } from "lucide-react";

export const Base64StudioTool: React.FC = () => {
  const [tab, setTab] = useState<"text" | "file">("text");
  
  // Text Mode State
  const [rawText, setRawText] = useState<string>("안녕하세요! Hello Base64 🚀");
  const [encodedText, setEncodedText] = useState<string>("");
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedEncoded, setCopiedEncoded] = useState(false);

  // File Mode State
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>("");
  const [copiedDataUrl, setCopiedDataUrl] = useState(false);

  // UTF-8 safe encode/decode
  const encodeUtf8Base64 = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      return btoa(binString);
    } catch {
      return "인코딩 오류";
    }
  };

  const decodeUtf8Base64 = (b64: string) => {
    try {
      const binString = atob(b64.trim());
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return "올바르지 않은 Base64 형식입니다.";
    }
  };

  const handleTextEncode = () => {
    setEncodedText(encodeUtf8Base64(rawText));
  };

  const handleTextDecode = () => {
    setRawText(decodeUtf8Base64(encodedText));
  };

  // Initial sync
  React.useEffect(() => {
    if (rawText && !encodedText) {
      setEncodedText(encodeUtf8Base64(rawText));
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setTab("text")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            tab === "text" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>텍스트 인코딩 / 디코딩</span>
        </button>
        <button
          onClick={() => setTab("file")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            tab === "file" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>파일 & 이미지 Base64 Data URI 변환</span>
        </button>
      </div>

      {tab === "text" ? (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTextEncode}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <span>인코딩 (Text → Base64)</span>
              </button>
              <button
                onClick={handleTextDecode}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <span>디코딩 (Base64 → Text)</span>
              </button>
            </div>
            <button
              onClick={() => {
                setRawText("");
                setEncodedText("");
              }}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>모두 지우기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Text */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700">일반 텍스트 (UTF-8 지원)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rawText);
                    setCopiedRaw(true);
                    setTimeout(() => setCopiedRaw(false), 1500);
                  }}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {copiedRaw ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRaw ? "복사됨" : "복사"}</span>
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setEncodedText(encodeUtf8Base64(e.target.value));
                }}
                rows={10}
                className="w-full p-4 font-sans text-xs text-slate-800 focus:outline-none resize-y"
                placeholder="인코딩할 일반 텍스트를 입력하세요..."
              />
            </div>

            {/* Encoded Base64 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Base64 문자열</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(encodedText);
                    setCopiedEncoded(true);
                    setTimeout(() => setCopiedEncoded(false), 1500);
                  }}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {copiedEncoded ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEncoded ? "복사됨" : "복사"}</span>
                </button>
              </div>
              <textarea
                value={encodedText}
                onChange={(e) => {
                  setEncodedText(e.target.value);
                  setRawText(decodeUtf8Base64(e.target.value));
                }}
                rows={10}
                className="w-full p-4 font-mono text-xs text-slate-800 focus:outline-none resize-y break-all"
                placeholder="디코딩할 Base64 문자열을 붙여넣으세요..."
              />
            </div>
          </div>
        </div>
      ) : (
        /* File to Base64 */
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center bg-white transition-colors cursor-pointer"
            onClick={() => document.getElementById("base64-file-input")?.click()}
          >
            <input
              type="file"
              id="base64-file-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              이미지나 파일을 드래그하여 놓거나 클릭하여 선택하세요
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP, SVG, PDF 등 모든 파일 지원</p>
          </div>

          {fileDataUrl && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-sm font-bold text-slate-900">{fileName}</span>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {fileType || "application/octet-stream"} • {(fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fileDataUrl);
                    setCopiedDataUrl(true);
                    setTimeout(() => setCopiedDataUrl(false), 1500);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedDataUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDataUrl ? "복사 완료" : "Data URI 전체 복사"}</span>
                </button>
              </div>

              {fileType.startsWith("image/") && (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3 rounded-lg">
                  <img
                    src={fileDataUrl}
                    alt="Uploaded preview"
                    className="max-h-32 max-w-full rounded border border-slate-200 shadow-xs object-contain"
                  />
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">HTML 태그 복사:</p>
                    <code className="block bg-white p-2 border border-slate-200 rounded text-[11px] font-mono break-all select-all">
                      &lt;img src="{fileDataUrl.slice(0, 45)}..." alt="{fileName}" /&gt;
                    </code>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  생성된 Base64 Data URI 문자열:
                </label>
                <textarea
                  readOnly
                  value={fileDataUrl}
                  rows={5}
                  className="w-full p-2.5 bg-slate-50 font-mono text-[11px] text-slate-700 border border-slate-200 rounded-lg select-all"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
