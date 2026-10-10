export type ToolCategory =
  | "all"
  | "text"          // 텍스트 변환 & 문서
  | "file"          // 파일 & 포맷 변환
  | "media"         // 이미지 & 디자인
  | "developer"     // 개발자 & 데이터
  | "math"          // 수학 & 단위 계산
  | "productivity"  // 생산성 & 시간
  | "ai";           // AI 인공지능

export interface ToolDefinition {
  id: string;
  name: string;
  koreanName: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: "HOT" | "NEW" | "AI" | "PRO";
  tags: string[];
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  iconName: string;
  description: string;
  popularTags?: string[];
}

export interface ToolUsageRecord {
  count: number;
  lastUsedAt: number; // timestamp
}

export type ToolUsageMap = Record<string, ToolUsageRecord>;

export interface RecommendedToolItem {
  tool: ToolDefinition;
  reason: string;
  score: number;
  badgeType: "affinity" | "trending" | "co_usage" | "frequency";
}
