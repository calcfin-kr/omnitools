import React, { useState } from "react";
import { Percent, ArrowUpRight, ArrowDownRight, Receipt, Tag } from "lucide-react";

export const PercentageCalcTool: React.FC = () => {
  // 1. Ratio
  const [totalVal, setTotalVal] = useState<number>(50000);
  const [percentVal, setPercentVal] = useState<number>(15);

  // 2. Diff
  const [valA, setValA] = useState<number>(10000);
  const [valB, setValB] = useState<number>(13500);

  // 3. VAT
  const [vatInput, setVatInput] = useState<number>(110000);
  const [vatMode, setVatMode] = useState<"inclusive" | "exclusive">("inclusive"); // inclusive: 합계금액 기준, exclusive: 공급가액 기준

  // 4. Discount
  const [origPrice, setOrigPrice] = useState<number>(89000);
  const [discountRate, setDiscountRate] = useState<number>(20);

  // Calcs
  const ratioResult = (totalVal * percentVal) / 100;

  const diffRate = valA !== 0 ? ((valB - valA) / valA) * 100 : 0;

  const vatCalc = () => {
    if (vatMode === "inclusive") {
      // 합계금액 입력 -> 공급가액 = 합계 / 1.1, 부가세 = 합계 - 공급가액
      const supply = Math.round(vatInput / 1.1);
      const vat = vatInput - supply;
      return { supply, vat, total: vatInput };
    } else {
      // 공급가액 입력 -> 부가세 = 10%, 합계 = 공급가액 + 부가세
      const vat = Math.round(vatInput * 0.1);
      const total = vatInput + vat;
      return { supply: vatInput, vat, total };
    }
  };
  const vatResult = vatCalc();

  const discountAmount = Math.round((origPrice * discountRate) / 100);
  const finalDiscountPrice = origPrice - discountAmount;

  return (
    <div className="space-y-6">
      {/* 4 Cards in 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: X의 Y% 계산 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Percent className="w-4 h-4 text-indigo-600" />
            <span>비율 계산 (X의 Y%는?)</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={totalVal}
              onChange={(e) => setTotalVal(Number(e.target.value))}
              className="w-1/2 p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
              placeholder="전체값 (X)"
            />
            <span className="text-xs text-slate-400 font-medium">의</span>
            <input
              type="number"
              value={percentVal}
              onChange={(e) => setPercentVal(Number(e.target.value))}
              className="w-24 p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
              placeholder="비율 (Y)"
            />
            <span className="text-xs text-slate-400 font-medium">% =</span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="text-xs text-indigo-900 font-medium">결과값</span>
            <span className="text-lg font-bold font-mono text-indigo-600">
              {ratioResult.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: 증감률 계산 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            {diffRate >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            )}
            <span>증감률 변화 계산 (A → B)</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={valA}
              onChange={(e) => setValA(Number(e.target.value))}
              className="w-1/2 p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
              placeholder="이전 값 (A)"
            />
            <span className="text-xs text-slate-400 font-medium">에서</span>
            <input
              type="number"
              value={valB}
              onChange={(e) => setValB(Number(e.target.value))}
              className="w-1/2 p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
              placeholder="이후 값 (B)"
            />
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              diffRate >= 0
                ? "bg-emerald-50/60 border-emerald-100 text-emerald-900"
                : "bg-rose-50/60 border-rose-100 text-rose-900"
            }`}
          >
            <span className="text-xs font-medium">
              변화: {diffRate >= 0 ? "증가 (+)" : "감소 (-)"}
            </span>
            <span className="text-lg font-bold font-mono">
              {diffRate > 0 ? `+${diffRate.toFixed(2)}` : diffRate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Card 3: 부가세(VAT 10%) 계산기 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Receipt className="w-4 h-4 text-purple-600" />
              <span>부가세(VAT 10%) 계산기</span>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                onClick={() => setVatMode("inclusive")}
                className={`px-2 py-0.5 rounded-md font-medium ${
                  vatMode === "inclusive" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-slate-500"
                }`}
              >
                합계 금액 기준
              </button>
              <button
                onClick={() => setVatMode("exclusive")}
                className={`px-2 py-0.5 rounded-md font-medium ${
                  vatMode === "exclusive" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-slate-500"
                }`}
              >
                공급가액 기준
              </button>
            </div>
          </div>

          <input
            type="number"
            value={vatInput}
            onChange={(e) => setVatInput(Number(e.target.value))}
            className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
            placeholder={vatMode === "inclusive" ? "결제 합계금액 입력" : "공급가액 입력"}
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-slate-400 block text-[11px]">공급가액</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {vatResult.supply.toLocaleString()}원
              </span>
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg">
              <span className="text-purple-600 block text-[11px]">부가세 (10%)</span>
              <span className="font-mono font-bold text-purple-700 text-sm">
                {vatResult.vat.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: 세일 할인율 계산기 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Tag className="w-4 h-4 text-amber-600" />
            <span>세일 할인 가격 계산기</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={origPrice}
              onChange={(e) => setOrigPrice(Number(e.target.value))}
              className="w-2/3 p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
              placeholder="정상가 (원)"
            />
            <input
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(Number(e.target.value))}
              className="w-1/3 p-2.5 text-xs font-mono border border-slate-200 rounded-lg"
              placeholder="할인율 (%)"
            />
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-900 font-medium block">최종 할인가</span>
              <span className="text-[11px] text-amber-600">{discountAmount.toLocaleString()}원 절약</span>
            </div>
            <span className="text-lg font-bold font-mono text-amber-700">
              {finalDiscountPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
