import React, { useState, useEffect } from "react";
import { Copy, Check, Plus, Trash2, ExternalLink, Link2 } from "lucide-react";

interface QueryParam {
  key: string;
  value: string;
}

export const UrlParserTool: React.FC = () => {
  const [fullUrl, setFullUrl] = useState<string>(
    "https://example.com/search?keyword=omnitools&category=web&page=1&sort=recent#results"
  );
  const [protocol, setProtocol] = useState("");
  const [host, setHost] = useState("");
  const [pathname, setPathname] = useState("");
  const [hash, setHash] = useState("");
  const [params, setParams] = useState<QueryParam[]>([]);
  const [copied, setCopied] = useState(false);

  // Parse URL whenever fullUrl changes from input
  const parseUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      setProtocol(parsed.protocol);
      setHost(parsed.host);
      setPathname(parsed.pathname);
      setHash(parsed.hash);

      const parsedParams: QueryParam[] = [];
      parsed.searchParams.forEach((value, key) => {
        parsedParams.push({ key, value });
      });
      setParams(parsedParams);
    } catch {
      // invalid url, keep simple
    }
  };

  useEffect(() => {
    parseUrl(fullUrl);
  }, []);

  const handleFullUrlChange = (val: string) => {
    setFullUrl(val);
    parseUrl(val);
  };

  // Rebuild URL when table changes
  const updateUrlFromParts = (newParams: QueryParam[]) => {
    try {
      const url = new URL(fullUrl || "https://example.com");
      // clear search params
      const searchParams = new URLSearchParams();
      newParams.forEach((p) => {
        if (p.key.trim()) searchParams.append(p.key.trim(), p.value);
      });
      url.search = searchParams.toString();
      setFullUrl(url.toString());
      setParams(newParams);
    } catch {
      // fallback
    }
  };

  const handleParamChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...params];
    updated[index][field] = val;
    updateUrlFromParts(updated);
  };

  const handleAddParam = () => {
    const updated = [...params, { key: "", value: "" }];
    setParams(updated);
  };

  const handleRemoveParam = (index: number) => {
    const updated = params.filter((_, i) => i !== index);
    updateUrlFromParts(updated);
  };

  const handleEncodeFull = () => {
    setFullUrl(encodeURI(fullUrl));
  };

  const handleDecodeFull = () => {
    try {
      setFullUrl(decodeURIComponent(fullUrl));
    } catch {
      // do nothing
    }
  };

  return (
    <div className="space-y-5">
      {/* Input & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-indigo-500" />
            <span>분석 및 편집할 전체 URL</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecodeFull}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              URL 디코딩
            </button>
            <button
              onClick={handleEncodeFull}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              URL 인코딩
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "복사됨" : "URL 복사"}</span>
            </button>
          </div>
        </div>

        <input
          type="text"
          value={fullUrl}
          onChange={(e) => handleFullUrlChange(e.target.value)}
          placeholder="https://example.com/path?key=value..."
          className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium">프로토콜 (Protocol)</span>
          <div className="text-xs font-mono font-bold text-slate-800 mt-1">{protocol || "N/A"}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium">호스트 (Host / Domain)</span>
          <div className="text-xs font-mono font-bold text-indigo-600 mt-1 truncate">{host || "N/A"}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium">경로 (Pathname)</span>
          <div className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">{pathname || "/"}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 font-medium">해시 (Hash Fragment)</span>
          <div className="text-xs font-mono font-bold text-slate-800 mt-1">{hash || "없음"}</div>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-700">
            쿼리 파라미터 (Query Parameters, {params.length}개)
          </span>
          <button
            onClick={handleAddParam}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>파라미터 추가</span>
          </button>
        </div>

        {params.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            URL에 쿼리 스트링 파라미터가 없습니다. 위의 '파라미터 추가' 버튼으로 새 키-값을 추가해보세요.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {params.map((param, index) => (
              <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50/60 transition-colors">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => handleParamChange(index, "key", e.target.value)}
                  placeholder="Key (예: keyword)"
                  className="w-1/3 p-2 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-400 font-bold">=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => handleParamChange(index, "value", e.target.value)}
                  placeholder="Value (예: omnitools)"
                  className="flex-1 p-2 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleRemoveParam(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
