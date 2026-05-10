export interface BrandIdentityResult {
  identity: string;
  vibe: string;
  tagline: string;
  palette: string[];
  caption: string;
  story: string | {
    title?: string;
    logline?: string;
    concept?: string;
  };
  strategy?: {
    marketing?: string[];
    content?: string[];
    sales?: string[];
  };
  brandKit?: {
    targetAudience?: string;
    brandPositioning?: string;
    emotionTrigger?: string;
  };
  brandName?: {
    evaluation: string;
    potentialScore: number | string;
    suggestions: string[];
  };
  executionPlan?: {
    day1?: string;
    week1?: string;
    growthPlan?: string;
  };
  monetization?: {
    quickWin?: string;
    pricingStrategy?: string;
    upsellStrategy?: string;
    salesChannel?: string[];
  };
  contentPlan?: {
    "7DaysContent"?: string[];
  };
  differentiation?: string;
}

export interface HistoryItem extends BrandIdentityResult {
  id: string;
  timestamp: number;
}
