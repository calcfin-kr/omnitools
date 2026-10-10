import React, { useState } from "react";
import { ToolDefinition, ToolCategory, RecommendedToolItem, ToolUsageMap } from "../../types";
import { RecommendationResult } from "../../utils/recommendationEngine";
import { DynamicIcon } from "../common/DynamicIcon";
import {
  Sparkles,
  Flame,
  PieChart,
  RotateCcw,
  Star,
  ChevronRight,
  TrendingUp,
  Compass,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface PersonalizedRecommendationSectionProps {
  recommendations: RecommendationResult;
  usageMap: ToolUsageMap;
  favorites: string[];
  onSelectTool: (toolId: string) => void;
  onToggleFavorite: (toolId: string, e: React.MouseEvent) => void;
  onResetUsage: () => void;
}

export const PersonalizedRecommendationSection: React.FC<PersonalizedRecommendationSectionProps> = ({
  recommendations,
  usageMap,
  favorites,
  onSelectTool,
  onToggleFavorite,
  onResetUsage,
}) => {
  const [activeTab, setActiveTab] = useState<"forYou" | "mostUsed" | "insights">("forYou");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { recommended, mostUsed, topCategory, categoryPercentages, totalVisits } = recommendations;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden">
      {/* Decorative gradient aura */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">개인 맞춤 도구 추천 &amp; 취향 분석</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                스마트 알고리즘
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalVisits > 0
                ? `총 ${totalVisits}회의 도구 이용 기록 및 관심 카테고리를 분석한 맞춤 결과입니다.`
                : "도구를 사용할수록 회원님의 작업 스타일에 맞는 유용한 도구를 정밀하게 추천해 드립니다."}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === "forYou"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>맞춤 추천 ({recommended.length})</span>
          </button>

          {mostUsed.length > 0 && (
            <button
              onClick={() => setActiveTab("mostUsed")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === "mostUsed"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>자주 사용 ({mostUsed.length})</span>
            </button>
          )}

          {totalVisits > 0 && (
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === "insights"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-violet-500" />
              <span>취향 리포트</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Recommended For You */}
      {activeTab === "forYou" && (
        <div className="space-y-3">
          {topCategory && totalVisits > 0 && (
            <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-indigo-900">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>
                  회원님은 평소 <strong>{topCategory.name}</strong> 관련 작업을 가장 많이 진행하셨습니다 ({topCategory.percentage}% 비중).
                </span>
              </span>
              <span className="text-[11px] font-medium text-indigo-600 hidden md:inline">
                이를 바탕으로 다음 작업을 돕는 도구들을 선별했습니다.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommended.map(({ tool, reason, badgeType }) => {
              const isFav = favorites.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-400 bg-slate-50/50 hover:bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Icon + Badge + Favorite */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg bg-white group-hover:bg-indigo-50 border border-slate-200 group-hover:border-indigo-100 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 transition-colors shadow-2xs">
                        <DynamicIcon name={tool.iconName} className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            badgeType === "affinity"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : badgeType === "co_usage"
                              ? "bg-violet-50 text-violet-700 border-violet-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {badgeType === "affinity"
                            ? "취향 맞춤"
                            : badgeType === "co_usage"
                            ? "연계 추천"
                            : "인기 추천"}
                        </span>
                        <button
                          onClick={(e) => onToggleFavorite(tool.id, e)}
                          className="p-1 text-slate-300 hover:text-amber-400"
                          title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                      <span>{tool.koreanName}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 mb-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Recommendation Reason Label */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-indigo-700 font-medium truncate pr-2 max-w-[80%]">
                      ★ {reason}
                    </span>
                    <span className="text-indigo-600 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center">
                      실행 <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Most Used Tools */}
      {activeTab === "mostUsed" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mostUsed.map((tool, idx) => {
            const count = usageMap[tool.id]?.count || 0;
            const isFav = favorites.includes(tool.id);
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-400 bg-slate-50/50 hover:bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-white group-hover:bg-indigo-50 border border-slate-200 group-hover:border-indigo-100 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 transition-colors shadow-2xs">
                      <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                      {tool.koreanName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      총 {count}회 이용
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => onToggleFavorite(tool.id, e)}
                    className="p-1 text-slate-300 hover:text-amber-400"
                    title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Affinity Insights Report */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>도구 카테고리별 이용 분포 분석</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                누적 도구 실행: <strong>{totalVisits}회</strong>
              </span>
            </div>

            <div className="space-y-2.5">
              {categoryPercentages
                .filter((c) => c.percentage > 0)
                .map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">{cat.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {cat.count}회 ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Reset Management Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1 text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>모든 이용 데이터는 브라우저 로컬 스토리지에만 보관되며 외부로 전송되지 않습니다.</span>
            </span>

            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-rose-600 text-[11px] font-bold">기록을 모두 초기화할까요?</span>
                <button
                  onClick={() => {
                    onResetUsage();
                    setShowResetConfirm(false);
                    setActiveTab("forYou");
                  }}
                  className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                >
                  네, 초기화
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium hover:bg-slate-300"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>이용 기록 초기화</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
