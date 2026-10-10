import React, { useState, useMemo } from "react";
import { ArrowRightLeft, Download, Copy, Check, FileSpreadsheet, UploadCloud, AlertCircle } from "lucide-react";

export const CsvJsonConverterTool: React.FC = () => {
  const [direction, setDirection] = useState<"csv2json" | "json2csv">("csv2json");
  const [delimiter, setDelimiter] = useState<string>(",");
  const [hasHeader, setHasHeader] = useState<boolean>(true);

  const sampleCsv = `id,name,email,role,active
1,홍길동,hong@example.com,관리자,true
2,이순신,lee@example.com,엔지니어,true
3,김영희,kim@example.com,디자이너,false
4,박철수,park@example.com,마케터,true`;

  const [inputCsv, setInputCsv] = useState<string>(sampleCsv);
  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify(
      [
        { id: 1, name: "홍길동", email: "hong@example.com", role: "관리자", active: true },
        { id: 2, name: "이순신", email: "lee@example.com", role: "엔지니어", active: true },
        { id: 3, name: "김영희", email: "kim@example.com", role: "디자이너", active: false },
      ],
      null,
      2
    )
  );

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert CSV to JSON
  const convertCsvToJson = (): { jsonStr: string; previewRows: any[] } => {
    try {
      setError(null);
      const lines = inputCsv
        .trim()
        .split(/\r\n|\n|\r/)
        .filter((l) => l.length > 0);

      if (lines.length === 0) return { jsonStr: "[]", previewRows: [] };

      // Helper to parse line respecting quotes
      const parseCsvLine = (line: string, delim: string) => {
        const regex = new RegExp(`(?:${delim}|^)(?:"([^"]*)"|([^"${delim}]*))`, "g");
        const row: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          let val = match[1] !== undefined ? match[1] : match[2];
          row.push(val !== undefined ? val.trim() : "");
        }
        return row;
      };

      const headers = hasHeader
        ? parseCsvLine(lines[0], delimiter)
        : lines[0].split(delimiter).map((_, i) => `column_${i + 1}`);

      const dataLines = hasHeader ? lines.slice(1) : lines;
      const result: any[] = [];

      for (const line of dataLines) {
        const values = parseCsvLine(line, delimiter);
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          const raw = values[idx] || "";
          if (raw.toLowerCase() === "true") obj[h] = true;
          else if (raw.toLowerCase() === "false") obj[h] = false;
          else if (raw !== "" && !isNaN(Number(raw))) obj[h] = Number(raw);
          else obj[h] = raw;
        });
        result.push(obj);
      }

      return {
        jsonStr: JSON.stringify(result, null, 2),
        previewRows: result.slice(0, 10),
      };
    } catch (err: any) {
      setError(err.message || "CSV 파싱 중 오류가 발생했습니다.");
      return { jsonStr: "[]", previewRows: [] };
    }
  };

  // Convert JSON to CSV
  const convertJsonToCsv = (): { csvStr: string; previewRows: any[] } => {
    try {
      setError(null);
      const parsed = JSON.parse(inputJson);
      const arr = Array.isArray(parsed) ? parsed : [parsed];

      if (arr.length === 0) return { csvStr: "", previewRows: [] };

      // Extract all unique keys
      const keys = Array.from(
        new Set(arr.flatMap((item) => (item && typeof item === "object" ? Object.keys(item) : [])))
      );

      const headerLine = keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(delimiter);
      const dataRows = arr.map((item) => {
        return keys
          .map((k) => {
            const val = item ? item[k] : "";
            const strVal = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
            return `"${strVal.replace(/"/g, '""')}"`;
          })
          .join(delimiter);
      });

      const csvResult = [headerLine, ...dataRows].join("\n");
      return { csvStr: csvResult, previewRows: arr.slice(0, 10) };
    } catch (err: any) {
      setError("유효한 JSON 배열 형식을 입력해주세요.");
      return { csvStr: "", previewRows: [] };
    }
  };

  const { outputText, previewRows } = useMemo(() => {
    if (direction === "csv2json") {
      const res = convertCsvToJson();
      return { outputText: res.jsonStr, previewRows: res.previewRows };
    } else {
      const res = convertJsonToCsv();
      return { outputText: res.csvStr, previewRows: res.previewRows };
    }
  }, [direction, inputCsv, inputJson, delimiter, hasHeader]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const ext = direction === "csv2json" ? "json" : "csv";
    const mime = direction === "csv2json" ? "application/json" : "text/csv;charset=utf-8;";
    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted_data.${ext}`;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith(".json")) {
        setDirection("json2csv");
        setInputJson(content);
      } else {
        setDirection("csv2json");
        setInputCsv(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Direction & Settings Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Toggle Direction */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setDirection("csv2json")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              direction === "csv2json" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV / TSV → JSON 변환</span>
          </button>
          <button
            onClick={() => setDirection("json2csv")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              direction === "json2csv" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>JSON → CSV 변환</span>
          </button>
        </div>

        {/* Delimiter & Options */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">구분자(Delimiter):</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium"
            >
              <option value=",">쉼표 (Comma ,)</option>
              <option value="&#9;">탭 (Tab \t - TSV)</option>
              <option value=";">세미콜론 (Semicolon ;)</option>
              <option value="|">파이프 (Pipe |)</option>
            </select>
          </div>

          {direction === "csv2json" && (
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>첫 줄을 헤더(키)로 사용</span>
            </label>
          )}

          {/* File Upload Button */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>파일 불러오기</span>
            <input
              type="file"
              accept=".csv,.tsv,.json,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Side by side Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-700">
              {direction === "csv2json" ? "입력 CSV / TSV 텍스트" : "입력 JSON 텍스트"}
            </span>
            <button
              onClick={() => {
                if (direction === "csv2json") setInputCsv(sampleCsv);
                else
                  setInputJson(
                    JSON.stringify(
                      [
                        { id: 1, name: "홍길동", role: "관리자" },
                        { id: 2, name: "이순신", role: "엔지니어" },
                      ],
                      null,
                      2
                    )
                  );
              }}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              샘플 불러오기
            </button>
          </div>

          <textarea
            value={direction === "csv2json" ? inputCsv : inputJson}
            onChange={(e) => {
              if (direction === "csv2json") setInputCsv(e.target.value);
              else setInputJson(e.target.value);
            }}
            rows={12}
            className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed bg-slate-50/50"
            placeholder={direction === "csv2json" ? "CSV 텍스트를 입력하거나 붙여넣으세요..." : "JSON 배열을 입력하세요..."}
          />
        </div>

        {/* Output Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-700">
              {direction === "csv2json" ? "변환된 JSON 결과" : "변환된 CSV 결과"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "복사됨" : "결과 복사"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 ml-2"
              >
                <Download className="w-3 h-3" />
                <span>다운로드</span>
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={outputText}
            rows={12}
            className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 leading-relaxed focus:outline-none select-all"
          />
        </div>
      </div>

      {/* Table Live Preview (First 10 rows) */}
      {previewRows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">데이터 표 미리보기 (상위 10개 행)</span>
            <span className="text-[11px] text-slate-400">총 {previewRows.length}개 객체 파싱됨</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  {Object.keys(previewRows[0] || {}).map((col) => (
                    <th key={col} className="p-2.5 font-mono">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="p-2.5 truncate max-w-xs">
                        {typeof val === "boolean" ? (
                          <span className={val ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {String(val)}
                          </span>
                        ) : typeof val === "object" ? (
                          JSON.stringify(val)
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
