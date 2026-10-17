import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StepHeader } from './components/StepHeader';
import { Step1Item } from './components/Step1Item';
import { Step2Problem } from './components/Step2Problem';
import { Step3Options } from './components/Step3Options';
import { HistoryView } from './components/HistoryView';
import { GuidesModal } from './components/GuidesModal';
import { AssessmentDraft, AssessmentRecord, OptionDetail as OptionDetailType, ActionType } from './types';
import { scoreOptions } from './engine/scoreOptions';
import { StorageService } from './services/storage';
import { AmbientBackground } from './components/AmbientBackground';

type ViewMode = 'step1' | 'step2' | 'options' | 'history';

const DEFAULT_DRAFT: AssessmentDraft = {
  itemName: '',
  condition: 'broken',
  problem: '',
  notes: '',
};

export default function App() {
  // Load saved draft or initialize with default demo case
  const [draft, setDraft] = useState<AssessmentDraft>(() => {
    const saved = StorageService.getDraft();
    return saved || DEFAULT_DRAFT;
  });

  // Track active view screen
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    // Check initial pathname or hash
    const path = window.location.hash.replace('#', '') || window.location.pathname;
    if (path.includes('history')) return 'history';
    if (path.includes('options')) return 'options';
    if (path.includes('step2')) return 'step2';
    return 'step1';
  });

  const [isGuidesOpen, setIsGuidesOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(() => StorageService.getHistory().length);
  const [committedAction, setCommittedAction] = useState<ActionType | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync draft changes to storage
  useEffect(() => {
    StorageService.saveDraft(draft);
  }, [draft]);

  // Sync view to browser history
  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    window.location.hash = `#${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'history' || hash === 'options' || hash === 'step2' || hash === 'step1') {
        setCurrentView(hash as ViewMode);
      } else {
        setCurrentView('step1');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateDraft = (partial: Partial<AssessmentDraft>) => {
    setDraft(prev => ({ ...prev, ...partial }));
  };

  const handleStartNew = () => {
    const freshDraft: AssessmentDraft = {
      itemName: '',
      condition: 'broken',
      problem: '',
      notes: '',
      customImage: undefined,
    };
    setDraft(freshDraft);
    setCommittedAction(undefined);
    StorageService.saveDraft(freshDraft);
    navigateTo('step1');
  };

  const handleCommitPathway = (option: OptionDetailType, completedChecklists: string[]) => {
    const record: AssessmentRecord = {
      id: `assess-${Date.now()}`,
      itemName: draft.itemName,
      condition: draft.condition,
      problem: draft.problem || 'Standard assessment',
      notes: draft.notes,
      category: draft.category,
      genericPower: draft.genericPower,
      genericMaterial: draft.genericMaterial,
      customImage: draft.customImage,
      chosenAction: option.action,
      chosenFit: option.fit,
      createdAt: new Date().toISOString(),
      options: scoreResult.options,
      completedChecklistIds: completedChecklists,
      avoidedLandfillKg: option.action === 'repair' ? 1.4 : option.action === 'repurpose' ? 1.2 : 0.8,
      estSavedInr: option.action === 'repair' ? 850 : option.action === 'repurpose' ? 450 : 250,
    };

    StorageService.addRecord(record);
    setHistoryCount(StorageService.getHistory().length);
    setCommittedAction(option.action);

    setToastMessage(`Selected "${option.title}"! Added to your session history.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReopenRecord = (record: AssessmentRecord) => {
    setDraft({
      itemName: record.itemName,
      condition: record.condition,
      problem: record.problem,
      notes: record.notes,
      category: record.category,
      genericPower: record.genericPower,
      genericMaterial: record.genericMaterial,
      customImage: record.customImage,
    });
    setCommittedAction(record.chosenAction);
    navigateTo('options');
  };

  // Calculate score options dynamically based on current draft
  const scoreResult = scoreOptions(
    draft.itemName,
    draft.condition,
    draft.problem,
    {
      usesPower: draft.genericPower,
      material: draft.genericMaterial,
    }
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#182B24] relative overflow-hidden">
      {/* Live Ambient Organic Background */}
      <AmbientBackground />

      {/* Global Header */}
      <Header
        activeView={currentView}
        onNavigate={navigateTo}
        onOpenGuides={() => setIsGuidesOpen(true)}
        historyCount={historyCount}
        onStartNew={handleStartNew}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {currentView === 'history' ? (
          <HistoryView
            onReopen={handleReopenRecord}
            onNewAssessment={handleStartNew}
            onRecordsChange={() => setHistoryCount(StorageService.getHistory().length)}
          />
        ) : (
          <div className="w-full max-w-3xl mx-auto">
            {/* Stepper Header */}
            {currentView === 'step1' && (
              <StepHeader
                currentStep={1}
                draft={draft}
              />
            )}
            {currentView === 'step2' && (
              <StepHeader
                currentStep={2}
                draft={draft}
                onBack={() => navigateTo('step1')}
                onEdit={() => navigateTo('step1')}
              />
            )}
            {currentView === 'options' && (
              <StepHeader
                currentStep={3}
                draft={draft}
                onBack={() => navigateTo('step2')}
                onEdit={() => navigateTo('step1')}
              />
            )}

            {/* Step Views */}
            {currentView === 'step1' && (
              <Step1Item
                draft={draft}
                onUpdateDraft={updateDraft}
                onNext={() => navigateTo('step2')}
              />
            )}

            {currentView === 'step2' && (
              <Step2Problem
                draft={draft}
                onUpdateDraft={updateDraft}
                onBack={() => navigateTo('step1')}
                onNext={() => navigateTo('options')}
              />
            )}

            {currentView === 'options' && (
              <div className="w-full max-w-5xl -mx-0 sm:-mx-6 lg:-mx-16">
                <Step3Options
                  draft={draft}
                  scoreResult={scoreResult}
                  onEdit={() => navigateTo('step1')}
                  onCommitPath={handleCommitPathway}
                  committedOptionAction={committedAction}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Guides Modal */}
      {isGuidesOpen && <GuidesModal onClose={() => setIsGuidesOpen(false)} />}

      {/* Active Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#173D32] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-bounce-in border border-[#2C5B47]"
        >
          <span className="w-2 h-2 rounded-full bg-[#CBEA72]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
