import React, { useState } from "react";
import { ArrowRightLeft, Scale, Ruler, HardDrive, Thermometer, Square } from "lucide-react";

type UnitType = "length" | "weight" | "area" | "data" | "temp";

interface UnitDef {
  id: string;
  name: string;
  rate: number; // relative to base
}

export const UnitConverterTool: React.FC = () => {
  const [unitType, setUnitType] = useState<UnitType>("length");
  const [valFrom, setValFrom] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");

  const unitsConfig: Record<UnitType, { name: string; base: string; list: UnitDef[] }> = {
    length: {
      name: "길이 (Length)",
      base: "m",
      list: [
        { id: "mm", name: "밀리미터 (mm)", rate: 0.001 },
        { id: "cm", name: "센티미터 (cm)", rate: 0.01 },
        { id: "m", name: "미터 (m)", rate: 1 },
        { id: "km", name: "킬로미터 (km)", rate: 1000 },
        { id: "in", name: "인치 (inch)", rate: 0.0254 },
        { id: "ft", name: "피트 (feet)", rate: 0.3048 },
        { id: "yd", name: "야드 (yard)", rate: 0.9144 },
        { id: "mi", name: "마일 (mile)", rate: 1609.344 },
      ],
    },
    weight: {
      name: "무게 (Weight)",
      base: "kg",
      list: [
        { id: "mg", name: "밀리그램 (mg)", rate: 0.000001 },
        { id: "g", name: "그램 (g)", rate: 0.001 },
        { id: "kg", name: "킬로그램 (kg)", rate: 1 },
        { id: "ton", name: "톤 (t)", rate: 1000 },
        { id: "oz", name: "온스 (oz)", rate: 0.0283495 },
        { id: "lb", name: "파운드 (lb)", rate: 0.453592 },
        { id: "geun", name: "근 (한국 고유단위 600g)", rate: 0.6 },
      ],
    },
    area: {
      name: "넓이 / 면적 (Area)",
      base: "m2",
      list: [
        { id: "m2", name: "제곱미터 (㎡)", rate: 1 },
        { id: "pyeong", name: "평 (坪, 약 3.3058㎡)", rate: 3.305785 },
        { id: "ft2", name: "제곱피트 (sq ft)", rate: 0.092903 },
        { id: "ha", name: "헥타르 (ha)", rate: 10000 },
        { id: "acre", name: "에이커 (ac)", rate: 4046.86 },
      ],
    },
    data: {
      name: "데이터 용량 (Digital Storage)",
      base: "MB",
      list: [
        { id: "B", name: "바이트 (Byte)", rate: 0.00000095367431640625 },
        { id: "KB", name: "킬로바이트 (KB)", rate: 0.0009765625 },
        { id: "MB", name: "메가바이트 (MB)", rate: 1 },
        { id: "GB", name: "기가바이트 (GB)", rate: 1024 },
        { id: "TB", name: "테라바이트 (TB)", rate: 1048576 },
        { id: "PB", name: "페타바이트 (PB)", rate: 1073741824 },
      ],
    },
    temp: {
      name: "온도 (Temperature)",
      base: "c",
      list: [
        { id: "c", name: "섭씨 (℃)", rate: 1 },
        { id: "f", name: "화씨 (℉)", rate: 1 },
        { id: "k", name: "켈빈 (K)", rate: 1 },
      ],
    },
  };

  const convertValue = (val: number, from: string, to: string, type: UnitType): number => {
    if (isNaN(val)) return 0;
    if (from === to) return val;

    if (type === "temp") {
      let celsius = val;
      if (from === "f") celsius = ((val - 32) * 5) / 9;
      else if (from === "k") celsius = val - 273.15;

      if (to === "c") return Math.round(celsius * 100) / 100;
      if (to === "f") return Math.round(((celsius * 9) / 5 + 32) * 100) / 100;
      if (to === "k") return Math.round((celsius + 273.15) * 100) / 100;
      return celsius;
    }

    const currentList = unitsConfig[type].list;
    const fromRate = currentList.find((u) => u.id === from)?.rate || 1;
    const toRate = currentList.find((u) => u.id === to)?.rate || 1;

    // Convert to base, then to target
    const inBase = val * fromRate;
    const inTarget = inBase / toRate;

    return Math.round(inTarget * 1000000) / 1000000;
  };

  const convertedResult = convertValue(valFrom, fromUnit, toUnit, unitType);

  const handleTypeChange = (type: UnitType) => {
    setUnitType(type);
    const list = unitsConfig[type].list;
    setFromUnit(list[0].id);
    setToUnit(list[1] ? list[1].id : list[0].id);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "length", label: "길이", icon: Ruler },
          { id: "weight", label: "무게", icon: Scale },
          { id: "area", label: "면적 (평수)", icon: Square },
          { id: "data", label: "데이터 용량", icon: HardDrive },
          { id: "temp", label: "온도", icon: Thermometer },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleTypeChange(cat.id as UnitType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                unitType === cat.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* From */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-600">변환할 기준 값</label>
            <input
              type="number"
              value={valFrom}
              onChange={(e) => setValFrom(Number(e.target.value))}
              className="w-full p-3 text-lg font-mono font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            >
              {unitsConfig[unitType].list.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-2">
            <button
              onClick={swapUnits}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors border border-slate-200 shadow-2xs"
              title="단위 맞바꾸기"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-600">변환 결과</label>
            <div className="w-full p-3 text-lg font-mono font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100 rounded-xl truncate select-all">
              {convertedResult.toLocaleString()}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            >
              {unitsConfig[unitType].list.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick reference table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <span className="text-xs font-bold text-slate-700 block mb-3">
          '{valFrom} {fromUnit}' 기준 모든 단위 일괄 환산표
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {unitsConfig[unitType].list.map((item) => {
            const res = convertValue(valFrom, fromUnit, item.id, unitType);
            return (
              <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-400 truncate">{item.name}</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-0.5 truncate">
                  {res.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">{item.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
