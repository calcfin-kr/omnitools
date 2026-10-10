import React, { useState } from "react";
import { Dices, Trophy, Coins, Sparkles, RefreshCw } from "lucide-react";

export const RandomPickerTool: React.FC = () => {
  const [tab, setTab] = useState<"list" | "dice" | "coin">("list");

  // List Picker State
  const [itemsText, setItemsText] = useState(
    "철수\n영희\n민수\n지혜\n준호\n서연\n도윤\n하은"
  );
  const [pickCount, setPickCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  // Dice State
  const [diceCount, setDiceCount] = useState(2);
  const [diceResults, setDiceResults] = useState<number[]>([4, 6]);

  // Coin State
  const [coinResult, setCoinResult] = useState<"앞면 (Heads)" | "뒷면 (Tails)">("앞면 (Heads)");

  const handlePickWinners = () => {
    const items = itemsText
      .split(/\r\n|\r|\n/)
      .map((i) => i.trim())
      .filter(Boolean);

    if (items.length === 0) return;

    setIsPicking(true);
    let count = 0;
    const interval = setInterval(() => {
      // shuffle preview
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      setWinners(shuffled.slice(0, Math.min(pickCount, items.length)));
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 80);
  };

  const handleRollDice = () => {
    const results: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      results.push(Math.floor(Math.random() * 6) + 1);
    }
    setDiceResults(results);
  };

  const handleFlipCoin = () => {
    setCoinResult(Math.random() < 0.5 ? "앞면 (Heads)" : "뒷면 (Tails)");
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setTab("list")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === "list" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>명단 제비뽑기 / 당첨자 추첨</span>
        </button>
        <button
          onClick={() => setTab("dice")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === "dice" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>주사위 굴리기</span>
        </button>
        <button
          onClick={() => setTab("coin")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === "coin" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>동전 던지기</span>
        </button>
      </div>

      {tab === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Candidates input */}
          <div className="md:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">후보 / 항목 목록 (한 줄에 하나씩)</label>
              <span className="text-[11px] text-slate-400 font-mono">
                총 {itemsText.split("\n").filter((i) => i.trim()).length}개 항목
              </span>
            </div>
            <textarea
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              rows={8}
              className="w-full p-3 font-sans text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="추첨할 후보들을 입력하세요..."
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>추첨 인원수:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={pickCount}
                  onChange={(e) => setPickCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 p-1.5 text-xs font-mono border border-slate-200 rounded-lg text-center"
                />
                <span>명</span>
              </div>

              <button
                onClick={handlePickWinners}
                disabled={isPicking}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isPicking ? "추첨 중..." : "랜덤 추첨 시작"}</span>
              </button>
            </div>
          </div>

          {/* Results display */}
          <div className="md:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              추첨 결과 (선정자)
            </span>

            {winners.length === 0 ? (
              <div className="text-xs text-slate-400 py-10">
                '랜덤 추첨 시작' 버튼을 눌러 공정하게 추첨해보세요!
              </div>
            ) : (
              <div className="w-full space-y-2 max-h-64 overflow-y-auto my-2">
                {winners.map((winner, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-indigo-900 font-bold text-base font-sans shadow-2xs flex items-center justify-between"
                  >
                    <span className="text-xs text-indigo-500 font-mono font-normal">#{idx + 1}</span>
                    <span className="flex-1 text-center">{winner}</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "dice" && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-md mx-auto text-center space-y-6">
          <div className="flex justify-center items-center gap-3 text-xs text-slate-600">
            <span>주사위 개수:</span>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setDiceCount(n);
                  setDiceResults(Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1));
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  diceCount === n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {n}개
              </button>
            ))}
          </div>

          {/* Dices Display */}
          <div className="flex justify-center items-center gap-4 py-4 flex-wrap">
            {diceResults.map((num, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 shadow-md flex items-center justify-center text-2xl font-black text-slate-900 font-mono"
              >
                {num}
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            총합계:{" "}
            <strong className="text-indigo-600 text-sm font-mono">
              {diceResults.reduce((a, b) => a + b, 0)}
            </strong>
          </div>

          <button
            onClick={handleRollDice}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition-colors shadow-xs"
          >
            <Dices className="w-4 h-4" />
            <span>주사위 굴리기</span>
          </button>
        </div>
      )}

      {tab === "coin" && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-md mx-auto text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-300 shadow-md flex items-center justify-center mx-auto text-amber-800 font-bold text-sm">
            {coinResult.includes("앞면") ? "앞면" : "뒷면"}
          </div>

          <div className="text-lg font-bold text-slate-900 font-sans">
            결과: <span className="text-amber-600">{coinResult}</span>
          </div>

          <button
            onClick={handleFlipCoin}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition-colors shadow-xs"
          >
            <Coins className="w-4 h-4" />
            <span>동전 던지기</span>
          </button>
        </div>
      )}
    </div>
  );
};
