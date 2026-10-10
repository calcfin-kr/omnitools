import React from "react";
import { CategoryInfo, ToolCategory, ToolDefinition } from "../../types";
import { DynamicIcon } from "./DynamicIcon";
import { ChevronRight, Sparkles, Hash } from "lucide-react";

interface CategoryOverviewProps {
  categories: CategoryInfo[];
  tools: ToolDefinition[];
  activeCategory: ToolCategory | "favorites";
  onSelectCategory: (categoryId: ToolCategory | "favorites") => void;
  onSelectTag: (tag: string) => void;
}

export const CategoryOverview: React.FC<CategoryOverviewProps> = ({
  categories,
  tools,
  activeCategory,
  onSelectCategory,
  onSelectTag,
}) => {
  const getToolCount = (catId: ToolCategory) => {
    if (catId === "all") return tools.length;
    return tools.filter((t) => t.category === catId).length;
  };

  const displayCats = categories.filter((c) => c.id !== "all");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>주요 도구 카테고리 분류</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            이미지 편집, 텍스트 변환, 파일 변환 등 원하시는 목적에 맞는 카테고리를 선택하세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayCats.map((cat) => {
          const count = getToolCount(cat.id);
          const isSelected = activeCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? "bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/50 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-50 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600"
                    }`}
                  >
                    <DynamicIcon name={cat.iconName} className="w-4 h-4" />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : "bg-slate-100 text-slate-600 border-slate-200/60"
                    }`}
                  >
                    {count}개 도구
                  </span>
                </div>

                <h4
                  className={`text-xs font-bold transition-colors ${
                    isSelected ? "text-indigo-700 font-extrabold" : "text-slate-900 group-hover:text-indigo-600"
                  }`}
                >
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Popular Tag Chips */}
              {cat.popularTags && cat.popularTags.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1 flex-wrap">
                  {cat.popularTags.slice(0, 3).map((tag) => (
                    <button
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTag(tag);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 font-medium transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
