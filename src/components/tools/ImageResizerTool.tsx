import React, { useState, useRef } from "react";
import { UploadCloud, Download, RefreshCw, Image as ImageIcon, Check, Lock, Unlock } from "lucide-react";

export const ImageResizerTool: React.FC = () => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [origSize, setOrigSize] = useState(0);

  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<"image/webp" | "image/jpeg" | "image/png">("image/webp");
  const [quality, setQuality] = useState(0.85);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 지원됩니다.");
      return;
    }
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    setOrigSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImgSrc(src);

      const img = new Image();
      img.onload = () => {
        imageObjRef.current = img;
        setOrigWidth(img.width);
        setOrigHeight(img.height);
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        processImage(img, img.width, img.height, format, quality);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const processImage = (
    img: HTMLImageElement,
    w: number,
    h: number,
    fmt: string,
    q: number
  ) => {
    if (!img) return;
    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w));
    canvas.height = Math.max(1, Math.round(h));
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setResultSize(blob.size);
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
        }
        setIsProcessing(false);
      },
      fmt,
      q
    );
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && origWidth > 0) {
      const calculatedH = Math.round((val / origWidth) * origHeight);
      setTargetHeight(calculatedH);
      if (imageObjRef.current) processImage(imageObjRef.current, val, calculatedH, format, quality);
    } else {
      if (imageObjRef.current) processImage(imageObjRef.current, val, targetHeight, format, quality);
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && origHeight > 0) {
      const calculatedW = Math.round((val / origHeight) * origWidth);
      setTargetWidth(calculatedW);
      if (imageObjRef.current) processImage(imageObjRef.current, calculatedW, val, format, quality);
    } else {
      if (imageObjRef.current) processImage(imageObjRef.current, targetWidth, val, format, quality);
    }
  };

  const setScalePreset = (percent: number) => {
    const w = Math.round((origWidth * percent) / 100);
    const h = Math.round((origHeight * percent) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
    if (imageObjRef.current) processImage(imageObjRef.current, w, h, format, quality);
  };

  const downloadImage = () => {
    if (!resultUrl) return;
    const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png";
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${fileName}_resized.${ext}`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {!imgSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("img-resizer-file-input")?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-12 text-center bg-white transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="img-resizer-file-input"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">이미지 파일을 드래그하거나 클릭하여 업로드</h3>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP, GIF 등 모든 브라우저 지원 포맷</p>
          <span className="inline-block mt-3 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
            브라우저 내 100% 로컬 처리 (서버 전송 없음, 개인정보 보호)
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800">크기 및 해상도 조정</span>
                <button
                  onClick={() => setImgSrc(null)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  다른 이미지 선택
                </button>
              </div>

              {/* Quick scale presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400">비율 프리셋:</span>
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setScalePreset(pct)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Dimension Inputs */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">너비 (Width, px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">높이 (Height, px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className="flex items-center gap-1.5 text-indigo-600 font-medium"
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lockAspect ? "가로세로 비율 고정됨" : "비율 자유 변형"}</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  원본: {origWidth} × {origHeight} px
                </span>
              </div>
            </div>

            {/* Output Format & Compression */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <span className="text-xs font-bold text-slate-800 block">포맷 & 압축 설정</span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "image/webp", label: "WebP (추천, 고압축)" },
                  { id: "image/jpeg", label: "JPEG / JPG" },
                  { id: "image/png", label: "PNG (무손실)" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      setFormat(fmt.id as any);
                      if (imageObjRef.current)
                        processImage(imageObjRef.current, targetWidth, targetHeight, fmt.id, quality);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      format === fmt.id
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {format !== "image/png" && (
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                    <span>압축 품질 (Quality): {Math.round(quality * 100)}%</span>
                    <span className="text-slate-400">권장: 80~90%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setQuality(q);
                      if (imageObjRef.current)
                        processImage(imageObjRef.current, targetWidth, targetHeight, format, q);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview & Stats & Download */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center">
            <span className="text-xs font-bold text-slate-700 self-start mb-3">변환 미리보기</span>

            <div className="w-full max-h-72 bg-slate-50 rounded-lg p-2 border border-slate-200 flex items-center justify-center overflow-hidden">
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="Resized output"
                  className="max-h-64 max-w-full object-contain rounded shadow-xs"
                />
              ) : (
                <div className="text-xs text-slate-400">변환 중...</div>
              )}
            </div>

            {/* Size comparison card */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4 text-center">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400">원본 크기</span>
                <div className="text-sm font-mono font-bold text-slate-700 mt-0.5">
                  {(origSize / 1024).toFixed(1)} KB
                </div>
                <div className="text-[10px] text-slate-400">{origWidth}×{origHeight}</div>
              </div>
              <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[11px] text-emerald-600 font-semibold">변환 후 용량</span>
                <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5">
                  {(resultSize / 1024).toFixed(1)} KB
                  {origSize > 0 && (
                    <span className="text-xs font-normal ml-1">
                      (-{Math.round((1 - resultSize / origSize) * 100)}%)
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-emerald-600">{targetWidth}×{targetHeight}</div>
              </div>
            </div>

            <button
              onClick={downloadImage}
              disabled={!resultUrl}
              className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>변환된 이미지 다운로드</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
