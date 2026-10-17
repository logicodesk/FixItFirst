import { AssessmentDraft, AssessmentRecord } from '../types';

const DRAFT_KEY = 'fix_it_first_draft_v1';
const HISTORY_KEY = 'fix_it_first_history_v1';

// In-memory fallback in case localStorage is blocked or throws SecurityError
let memoryStorage: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    // Storage access blocked or restricted
  }
  return memoryStorage[key] || null;
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (err) {
    // Storage write blocked or quota exceeded
  }
  memoryStorage[key] = value;
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (err) {
    // ignore
  }
  delete memoryStorage[key];
}

export const StorageService = {
  getDraft(): AssessmentDraft | null {
    const raw = safeGet(DRAFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AssessmentDraft;
    } catch {
      return null;
    }
  },

  saveDraft(draft: AssessmentDraft): void {
    safeSet(DRAFT_KEY, JSON.stringify(draft));
  },

  clearDraft(): void {
    safeRemove(DRAFT_KEY);
  },

  getHistory(): AssessmentRecord[] {
    const raw = safeGet(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Discard any dummy or mock seed records from previous sessions
        const cleaned = parsed.filter(
          (r: AssessmentRecord) => r && r.id && !r.id.startsWith('seed-')
        );
        if (cleaned.length !== parsed.length) {
          this.saveHistoryList(cleaned);
        }
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveHistoryList(records: AssessmentRecord[]): void {
    safeSet(HISTORY_KEY, JSON.stringify(records));
  },

  clearAllHistory(): void {
    safeRemove(HISTORY_KEY);
  },

  addRecord(record: AssessmentRecord): void {
    const existing = this.getHistory();
    // Prepend new record or replace if same id
    const filtered = existing.filter(r => r.id !== record.id);
    const updated = [record, ...filtered];
    this.saveHistoryList(updated);
  },

  deleteRecord(id: string): void {
    const existing = this.getHistory();
    const updated = existing.filter(r => r.id !== id);
    this.saveHistoryList(updated);
  },

  getRecord(id: string): AssessmentRecord | undefined {
    return this.getHistory().find(r => r.id === id);
  },

  getAggregates(): { avoidedLandfillKg: number; estSavedInr: number } {
    const history = this.getHistory();
    if (history.length === 0) {
      return { avoidedLandfillKg: 0, estSavedInr: 0 };
    }
    const avoidedLandfillKg = history.reduce((acc, cur) => acc + (cur.avoidedLandfillKg || 0), 0);
    const estSavedInr = history.reduce((acc, cur) => {
      if (typeof cur.estSavedInr === 'number') return acc + cur.estSavedInr;
      if (typeof cur.estSavedUsd === 'number') return acc + Math.round(cur.estSavedUsd * 83);
      return acc + 0;
    }, 0);
    return {
      avoidedLandfillKg: Math.round(avoidedLandfillKg * 10) / 10,
      estSavedInr: Math.round(estSavedInr),
    };
  },
};
