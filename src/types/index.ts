export type ActionType = 'repair' | 'reuse' | 'repurpose' | 'replace' | 'recycle' | 'discard';

export type ConditionType = 'broken' | 'worn_out' | 'unused';

export type FitLevel = 'best_fit' | 'worth_considering' | 'unlikely';

export type CategoryKey = 
  | 'electronics-small-appliance'
  | 'furniture'
  | 'clothing-textile'
  | 'footwear-bags'
  | 'containers-household'
  | 'generic';

export interface ChecklistItem {
  id: string;
  text: string;
  detail?: string;
  isMandatorySafety?: boolean;
  done?: boolean;
}

export interface MetricDetail {
  level: string; // e.g., 'Low', 'Moderate', 'High', 'Free', 'Quick', 'Maximum'
  value: string; // e.g., '₹0 – ₹800', '15 – 30 mins', 'Beginner DIY'
  note: string; // Plain language clarification
  barPercent: number; // 0 - 100 for visual comparison
}

export interface HouseholdFix {
  title: string;
  bestInexpensiveWay: string;
  cost: string;
  materialsNeeded: string[];
  steps: string[];
  safetyNotice?: string;
}

export interface OptionDetail {
  action: ActionType;
  title: string;
  subtitle: string;
  score: number;
  fit: FitLevel;
  fitLabel: 'Best fit' | 'Worth considering' | 'Unlikely';
  reason: string; // One line crisp reason
  reasons: string[]; // 2-3 bullets for 'Why this could make sense'
  considerations: {
    cost: MetricDetail;
    effort: MetricDetail;
    time: MetricDetail;
    safety: MetricDetail;
    impact: MetricDetail;
  };
  optimalCriteria: string;
  checklists: ChecklistItem[];
  toolsNeeded?: string[];
  communityTip?: string;
  subsequentAction?: ActionType;
  subsequentLabel?: string;
  imagePath?: string;
  tagNote?: string;
  householdFix?: HouseholdFix;
}

export interface AssessmentDraft {
  itemName: string;
  condition: ConditionType;
  problem: string;
  notes?: string;
  category?: CategoryKey;
  genericPower?: boolean;
  genericMaterial?: string;
  customImage?: string; // Base64 data URL of user's uploaded picture
}

export interface AssessmentRecord extends AssessmentDraft {
  id: string;
  createdAt: string;
  chosenAction: ActionType;
  chosenFit: FitLevel;
  options: OptionDetail[];
  completedChecklistIds?: string[];
  avoidedLandfillKg?: number;
  estSavedInr?: number;
  estSavedUsd?: number;
}

export interface SafetyInfo {
  safetyFlag: boolean;
  title: string;
  description: string;
}
