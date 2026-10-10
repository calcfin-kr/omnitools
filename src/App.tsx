import React, { useState, useEffect, useMemo, useRef } from "react";
import { TOOLS, CATEGORIES } from "./data/toolsList";
import { ToolDefinition, ToolCategory } from "./types";
import { ToolRenderer } from "./components/ToolRenderer";
import { DynamicIcon } from "./components/common/DynamicIcon";
import {
  getToolUsageMap,
  recordToolUsage,
  clearToolUsageHistory,
  getPersonalizedRecommendations,
} from "./utils/recommendationEngine";
import { PersonalizedRecommendationSection } from "./components/recommendations/PersonalizedRecommendationSection";
import { CategoryOverview } from "./components/common/CategoryOverview";
import { AdSenseBanner } from "./components/common/AdSenseBanner";
import {
  Search,
  Star,
  Clock,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  X,
  ExternalLink,
  Layers,
  Wrench,
  CheckCircle2,
  ChevronRight,
  Zap,
  TrendingUp,
  Tag,
} from "lucide-react";

export default function App() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "favorites">("all");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("omnitools_favorites");
      return saved ? JSON.parse(saved) : ["text-counter", "json-formatter", "ai-assistant", "qr-studio", "csv-json-converter"];
    } catch {
      return ["text-counter", "json-formatter", "ai-assistant", "qr-studio", "csv-json-converter"];
    }
  });
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("omnitools_recent");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Usage tracking state for personalized recommendations
  const [usageMap, setUsageMap] = useState(() => getToolUsageMap());

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with URL Hash for natural browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && TOOLS.some((t) => t.id === hash)) {
        setSelectedToolId(hash);
        // Track usage on hash navigation
        const updated = recordToolUsage(hash);
        setUsageMap(updated);
      } else {
        setSelectedToolId(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Keyboard shortcut: / or Ctrl+K to search, Esc to return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
        } else if (selectedToolId) {
          selectTool(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, selectedToolId]);

  const selectTool = (toolId: string | null) => {
    if (toolId) {
      window.location.hash = toolId;
      setSelectedToolId(toolId);
      // Track usage count and recency for personalization engine
      const updated = recordToolUsage(toolId);
      setUsageMap(updated);

      // Update recent tools list
      setRecentTools((prev) => {
        const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 6);
        try {
          localStorage.setItem("omnitools_recent", JSON.stringify(next));
        } catch {}
        return next;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = "";
      setSelectedToolId(null);
    }
  };

  const toggleFavorite = (toolId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem("omnitools_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleResetUsage = () => {
    clearToolUsageHistory();
    setUsageMap({});
  };

  const currentTool = useMemo(
    () => TOOLS.find((t) => t.id === selectedToolId) || null,
    [selectedToolId]
  );

  // Personalized Recommendation Engine Results
  const recommendations = useMemo(
    () => getPersonalizedRecommendations(TOOLS, CATEGORIES, usageMap, favorites),
    [usageMap, favorites]
  );

  // Filtered tools for Dashboard
  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      // Favorites filter
      if (activeCategory === "favorites" && !favorites.includes(tool.id)) {
        return false;
      }
      // Category filter
      if (activeCategory !== "all" && activeCategory !== "favorites" && tool.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = tool.name.toLowerCase().includes(q);
        const matchKoName = tool.koreanName.toLowerCase().includes(q);
        const matchDesc = tool.description.toLowerCase().includes(q);
        const matchKeywords = tool.tags.some((k) => k.toLowerCase().includes(q));
        return matchName || matchKoName || matchDesc || matchKeywords;
      }
      return true;
    });
  }, [searchQuery, activeCategory, favorites]);

  // Suggested tools when inside a tool
  const suggestedTools = useMemo(() => {
    if (!currentTool) return [];
    return TOOLS
      .filter((t) => t.id !== currentTool.id && t.category === currentTool.category)
      .slice(0, 4);
  }, [currentTool]);

  const displayCategories = useMemo(
    () => CATEGORIES.filter((c) => c.id !== "all"),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => selectTool(null)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">OmniTools</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  온라인 도구함
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">다목적 실용 웹 툴킷 23종</p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedToolId && e.target.value) {
                  // Switch to dashboard view to see matching tools immediately
                  selectTool(null);
                }
              }}
              placeholder="도구 이름, 키워드 검색 (단축키: /)"
              className="w-full pl-10 pr-10 py-2 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/15 transition-all text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveCategory("favorites");
                if (selectedToolId) selectTool(null);
              }}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeCategory === "favorites" && !selectedToolId
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="즐겨찾는 도구 보기"
            >
              <Star className={`w-4 h-4 ${favorites.length > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
              <span className="hidden md:inline">즐겨찾기 ({favorites.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedToolId && currentTool ? (
          /* ========================================================
             DETAIL VIEW: SELECTED TOOL
             ======================================================== */
          <div className="space-y-6">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => selectTool(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors p-1 -ml-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>도구 목록으로 돌아가기</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleFavorite(currentTool.id, e)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    favorites.includes(currentTool.id)
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      favorites.includes(currentTool.id) ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                  <span>{favorites.includes(currentTool.id) ? "즐겨찾기 해제" : "즐겨찾기 추가"}</span>
                </button>
              </div>
            </div>

            {/* Tool Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                  <DynamicIcon name={currentTool.iconName} className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900">{currentTool.koreanName}</h1>
                    <span className="text-xs font-mono text-slate-400">({currentTool.name})</span>
                    {(currentTool.category === "ai" || currentTool.badge === "AI") && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3" />
                        Gemini AI 연동
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{currentTool.description}</p>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentTool.tags.slice(0, 3).map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Mounted Tool Component */}
            <div className="bg-slate-50">
              <ToolRenderer toolId={currentTool.id} />
            </div>

            {/* Google AdSense Unit in Detail View */}
            <AdSenseBanner format="horizontal" label="스폰서 추천 정보" />

            {/* Related Tools in same category */}
            {suggestedTools.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>함께 많이 사용하는 관련 도구</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {suggestedTools.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => selectTool(tool.id)}
                      className="p-3.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
                        <DynamicIcon name={tool.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate block">
                          {tool.koreanName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {tool.description}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================
             DASHBOARD VIEW: ALL TOOLS DIRECTORY
             ======================================================== */
          <div className="space-y-7">
            {/* 1. Category Classification Overview Cards (Requested: 이미지 편집, 텍스트 변환, 파일 변환 등) */}
            {!searchQuery && activeCategory === "all" && (
              <CategoryOverview
                categories={CATEGORIES}
                tools={TOOLS}
                activeCategory={activeCategory}
                onSelectCategory={(catId) => setActiveCategory(catId)}
                onSelectTag={(tag) => setSearchQuery(tag)}
              />
            )}

            {/* 2. Personalized Tool Recommendation & Usage Analytics */}
            {!searchQuery && activeCategory === "all" && (
              <PersonalizedRecommendationSection
                recommendations={recommendations}
                usageMap={usageMap}
                favorites={favorites}
                onSelectTool={selectTool}
                onToggleFavorite={toggleFavorite}
                onResetUsage={handleResetUsage}
              />
            )}

            {/* 3. Category Filter Pills Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                      activeCategory === "all"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>전체 도구 ({TOOLS.length})</span>
                  </button>

                  {displayCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                        activeCategory === cat.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}

                  <button
                    onClick={() => setActiveCategory("favorites")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                      activeCategory === "favorites"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>즐겨찾기 ({favorites.length})</span>
                  </button>
                </div>
              </div>

              {/* Active Category Header Banner if filtered */}
              {activeCategory !== "all" && activeCategory !== "favorites" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <DynamicIcon
                        name={CATEGORIES.find((c) => c.id === activeCategory)?.iconName || "Folder"}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {CATEGORIES.find((c) => c.id === activeCategory)?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {CATEGORIES.find((c) => c.id === activeCategory)?.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCategory("all")}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    전체 도구 보기
                  </button>
                </div>
              )}
            </div>

            {/* Recently Used Tools Bar (if any) */}
            {recentTools.length > 0 && activeCategory === "all" && !searchQuery && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 pl-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>최근 사용:</span>
                </span>
                <div className="flex items-center gap-2">
                  {recentTools.map((id) => {
                    const tool = TOOLS.find((t) => t.id === id);
                    if (!tool) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => selectTool(id)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-700 flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        <DynamicIcon name={tool.iconName} className="w-3 h-3 text-indigo-500" />
                        <span>{tool.koreanName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Google AdSense Banner on Dashboard */}
            <AdSenseBanner format="horizontal" />

            {/* Results counter & filter status */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                총 <strong>{filteredTools.length}</strong>개의 도구가 준비되어 있습니다.
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  검색 초기화
                </button>
              )}
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">일치하는 도구를 찾을 수 없습니다</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  '{searchQuery}'에 대한 검색 결과가 없습니다. 다른 검색어를 입력하거나 필터를 초기화해보세요.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  전체 도구 보기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map((tool) => {
                  const isFav = favorites.includes(tool.id);
                  const isAiTool = tool.category === "ai" || tool.badge === "AI";
                  const usageCount = usageMap[tool.id]?.count || 0;

                  return (
                    <div
                      key={tool.id}
                      onClick={() => selectTool(tool.id)}
                      className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Top card bar: Icon + Favorite Star */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-50 group-hover:bg-indigo-50 border border-slate-100 group-hover:border-indigo-100 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 transition-colors">
                            <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                          </div>

                          <div className="flex items-center gap-1">
                            {isAiTool && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">
                                AI
                              </span>
                            )}
                            {tool.badge && tool.badge !== "AI" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                                {tool.badge}
                              </span>
                            )}
                            <button
                              onClick={(e) => toggleFavorite(tool.id, e)}
                              className="p-1 rounded-md text-slate-300 hover:text-amber-400 transition-colors"
                              title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                            >
                              <Star className={`w-4 h-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <span>{tool.koreanName}</span>
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400 block mb-2">
                          {tool.name}
                        </span>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {tool.description}
                        </p>
                      </div>

                      {/* Bottom Category Tag & Usage counter */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">
                          {CATEGORIES.find((c) => c.id === tool.category)?.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {usageCount > 0 && (
                            <span className="text-[10px] font-mono text-slate-400 mr-1">
                              {usageCount}회 이용
                            </span>
                          )}
                          <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            열기 <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">OmniTools</span>
            <span>—</span>
            <span>다목적 올인원 온라인 도구 모음 플랫폼</span>
          </div>
          <p className="text-[11px]">
            클라이언트 보안 우선 (100% 브라우저 로컬 암호화/연산 지원) &amp; Gemini 3.8 Flash 연동
          </p>
        </div>
      </footer>
    </div>
  );
}

