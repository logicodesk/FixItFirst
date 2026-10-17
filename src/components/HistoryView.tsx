import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Leaf,
  PiggyBank,
  IndianRupee,
  Wrench,
  Recycle,
  Shuffle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Clock,
  Inbox,
} from 'lucide-react';
import { AssessmentRecord, ActionType } from '../types';
import { FitBadge } from './FitBadge';
import { StorageService } from '../services/storage';

interface HistoryViewProps {
  onReopen: (record: AssessmentRecord) => void;
  onNewAssessment: () => void;
  onRecordsChange?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onReopen,
  onNewAssessment,
  onRecordsChange,
}) => {
  const [records, setRecords] = useState<AssessmentRecord[]>(() =>
    StorageService.getHistory()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'repair' | 'recycle' | 'repurpose'>('all');

  const handleDelete = (id: string) => {
    StorageService.deleteRecord(id);
    setRecords(StorageService.getHistory());
    onRecordsChange?.();
  };

  const handleClearAll = () => {
    StorageService.clearAllHistory();
    setRecords([]);
    onRecordsChange?.();
  };

  const aggregates = StorageService.getAggregates();

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.chosenAction.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = filterTab === 'all' || r.chosenAction === filterTab;

    return matchesSearch && matchesTab;
  });

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'repair':
        return <Wrench className="w-4 h-4" />;
      case 'recycle':
        return <Recycle className="w-4 h-4" />;
      case 'repurpose':
        return <Shuffle className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Headline & Impact Metric Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2C5B47] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#CBEA72]" />
            <span>Archived Evaluations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#182B24] tracking-tight">
            Your session history
          </h1>
          <p className="text-sm sm:text-base text-[#66736B] mt-1.5">
            Review previously assessed household items, chosen pathways, and action checklists.
          </p>
        </div>

        {/* Quick Session Impact Telemetry Pill */}
        {records.length > 0 && (
          <div className="flex items-center gap-4 bg-white border border-[#DCE8DA] px-4 py-3 rounded-2xl shadow-xs self-start lg:self-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#DCE8DA] flex items-center justify-center text-[#173D32]">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#66736B] font-medium uppercase tracking-wider">
                  Avoided Landfill
                </p>
                <p className="text-lg font-bold text-[#173D32] leading-none">
                  ~{aggregates.avoidedLandfillKg} kg
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-[#E2E3DD]" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#CBEA72] flex items-center justify-center text-[#182B24]">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#66736B] font-medium uppercase tracking-wider">
                  Est. Saved
                </p>
                <p className="text-lg font-bold text-[#173D32] leading-none">
                  ₹{aggregates.estSavedInr.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Action Control Strip */}
      <div className="bg-white border border-[#DCE8DA] rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved items…"
              className="w-full bg-[#F7F8F2] text-sm text-[#182B24] placeholder:text-[#66736B]/70 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:bg-white border border-transparent focus:border-[#2C5B47] transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F7F8F2] p-1 rounded-xl">
            {(
              [
                { id: 'all', label: `All items (${records.length})` },
                { id: 'repair', label: 'Repairs' },
                { id: 'recycle', label: 'Recycled' },
                { id: 'repurpose', label: 'Repurposed' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterTab === tab.id
                    ? 'bg-[#173D32] text-white shadow-xs'
                    : 'text-[#66736B] hover:text-[#182B24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {records.length > 0 && (
            <button
              onClick={handleClearAll}
              className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#93000A] bg-white border border-[#DCE8DA] hover:bg-[#FFEBEE] rounded-xl transition-colors flex items-center justify-center gap-1.5"
              title="Clear all saved history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear history</span>
            </button>
          )}

          <button
            onClick={onNewAssessment}
            className="flex-1 md:flex-initial min-h-[44px] px-4 py-2 bg-[#CBEA72] hover:bg-[#b8dc5c] text-[#182B24] font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New assessment</span>
          </button>
        </div>
      </div>

      {/* Records List or Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-[#DCE8DA] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F8F2] flex items-center justify-center text-[#2C5B47]">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h2 className="text-lg font-bold text-[#182B24]">
              {searchQuery ? 'No matching assessments found' : 'Nothing in your history yet'}
            </h2>
            <p className="text-xs sm:text-sm text-[#66736B] mt-1">
              {searchQuery
                ? 'Try a different search term or reset your category filters.'
                : "Start with an item that's broken, worn out, or unused. We'll guide you through 6 practical pathways."}
            </p>
          </div>
          <button
            onClick={onNewAssessment}
            className="min-h-[44px] px-5 py-2.5 bg-[#CBEA72] text-[#182B24] font-bold text-sm rounded-xl shadow-xs hover:bg-[#b8dc5c] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Start an assessment</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRecords.map((record) => {
            const dateStr = new Date(record.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={record.id}
                className="group bg-white border border-[#DCE8DA] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#2C5B47]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-[#F7F8F2] border border-[#DCE8DA] overflow-hidden flex items-center justify-center text-[#2C5B47] shrink-0 relative">
                    {record.customImage ? (
                      <>
                        <img
                          src={record.customImage}
                          alt={record.itemName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#173D32] text-[#CBEA72] flex items-center justify-center shadow-xs">
                          {getActionIcon(record.chosenAction)}
                        </div>
                      </>
                    ) : (
                      getActionIcon(record.chosenAction)
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-[#182B24] truncate">
                        {record.itemName}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCE8DA] text-[#173D32]">
                        {getActionIcon(record.chosenAction)}
                        <span className="capitalize">{record.chosenAction}</span>
                      </span>
                      <FitBadge fit={record.chosenFit} size="sm" />
                    </div>

                    <p className="text-xs sm:text-sm text-[#66736B] flex items-center gap-2 flex-wrap">
                      <span className="capitalize">{record.condition.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className="truncate">{record.problem}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-[#66736B]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Assessed on {dateStr}</span>
                      {record.completedChecklistIds && record.completedChecklistIds.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[#2C5B47] font-semibold">
                            {record.completedChecklistIds.length} checklist steps completed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => onReopen(record)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F7F8F2] hover:bg-[#EDEEE8] text-[#182B24] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                    aria-label={`Reopen assessment for ${record.itemName}`}
                  >
                    <span>Reopen</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#2C5B47]" />
                  </button>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#66736B] hover:text-[#93000A] hover:bg-[#FFDAD6]/40 transition-colors"
                    aria-label={`Delete ${record.itemName} from history`}
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Friendly Bottom Discovery Banner */}
      <div className="relative bg-[#DCE8DA]/40 rounded-2xl p-6 sm:p-8 border border-[#DCE8DA] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#173D32] flex items-center justify-center text-[#CBEA72] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#182B24]">
              Nothing else checked yet?
            </h2>
            <p className="text-xs sm:text-sm text-[#66736B] mt-0.5 max-w-xl leading-relaxed">
              Start with an item in your attic, desk, or wardrobe. We'll help you figure out if it's worth fixing, passing along, or recycling responsibly.
            </p>
          </div>
        </div>

        <button
          onClick={onNewAssessment}
          className="min-h-[44px] px-5 py-2.5 bg-[#173D32] hover:bg-[#2C5B47] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <span>Start assessment</span>
          <ArrowRight className="w-4 h-4 text-[#CBEA72]" />
        </button>
      </div>
    </div>
  );
};
