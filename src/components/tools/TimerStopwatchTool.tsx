import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flag, Bell, Coffee, Brain } from "lucide-react";

export const TimerStopwatchTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pomodoro" | "stopwatch">("pomodoro");

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState<"work" | "short" | "long">("work");
  const pomoDurations = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const [pomoTimeLeft, setPomoTimeLeft] = useState<number>(pomoDurations.work);
  const [pomoIsRunning, setPomoIsRunning] = useState(false);

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchIsRunning, setStopwatchIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Web Audio chime sound
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // AudioContext not supported
    }
  };

  // Pomodoro Effect
  useEffect(() => {
    let interval: any = null;
    if (pomoIsRunning && pomoTimeLeft > 0) {
      interval = setInterval(() => {
        setPomoTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (pomoTimeLeft === 0 && pomoIsRunning) {
      setPomoIsRunning(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [pomoIsRunning, pomoTimeLeft]);

  // Stopwatch Effect
  useEffect(() => {
    let interval: any = null;
    if (stopwatchIsRunning) {
      const startTime = Date.now() - stopwatchTime;
      interval = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchIsRunning]);

  const changePomoMode = (mode: "work" | "short" | "long") => {
    setPomoMode(mode);
    setPomoIsRunning(false);
    setPomoTimeLeft(pomoDurations[mode]);
  };

  const formatPomoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatStopwatchTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;
  };

  const handleAddLap = () => {
    setLaps([stopwatchTime, ...laps]);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("pomodoro")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "pomodoro" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>포모도로 타이머 (25분/5분)</span>
        </button>
        <button
          onClick={() => setActiveTab("stopwatch")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "stopwatch" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>스톱워치 & 랩타임</span>
        </button>
      </div>

      {activeTab === "pomodoro" ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col items-center max-w-md mx-auto text-center space-y-6">
          {/* Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => changePomoMode("work")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pomoMode === "work" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600"
              }`}
            >
              집중 25분
            </button>
            <button
              onClick={() => changePomoMode("short")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pomoMode === "short" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-600"
              }`}
            >
              짧은 휴식 5분
            </button>
            <button
              onClick={() => changePomoMode("long")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pomoMode === "long" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
              }`}
            >
              긴 휴식 15분
            </button>
          </div>

          {/* Big Time Display */}
          <div className="text-6xl font-black font-mono tracking-tight text-slate-900 select-none">
            {formatPomoTime(pomoTimeLeft)}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPomoIsRunning(!pomoIsRunning)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs ${
                pomoIsRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {pomoIsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{pomoIsRunning ? "일시정지" : "시작"}</span>
            </button>
            <button
              onClick={() => {
                setPomoIsRunning(false);
                setPomoTimeLeft(pomoDurations[pomoMode]);
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="리셋"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Stopwatch */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <div className="text-5xl font-black font-mono tracking-tight text-slate-900 select-none">
              {formatStopwatchTime(stopwatchTime)}
            </div>
          </div>

          {/* Stopwatch Controls */}
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => setStopwatchIsRunning(!stopwatchIsRunning)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs ${
                stopwatchIsRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {stopwatchIsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{stopwatchIsRunning ? "정지" : "시작"}</span>
            </button>
            <button
              onClick={handleAddLap}
              disabled={!stopwatchIsRunning}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Flag className="w-4 h-4 text-indigo-600" />
              <span>랩 타임</span>
            </button>
            <button
              onClick={() => {
                setStopwatchIsRunning(false);
                setStopwatchTime(0);
                setLaps([]);
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Lap Times List */}
          {laps.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-1.5 max-h-48 overflow-y-auto">
              <span className="text-xs font-semibold text-slate-600 block mb-2">랩 타임 기록 ({laps.length}개)</span>
              {laps.map((lap, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 font-mono text-slate-700"
                >
                  <span className="text-slate-400">랩 {laps.length - i}</span>
                  <span className="font-bold">{formatStopwatchTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
