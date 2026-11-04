import { useState, useEffect } from 'react';
import { AppState, SplitType, Transaction } from './types';
import { loadAppState, saveAppState, getFreshSampleTransactions } from './utils/storage';
import { getLocalDateString } from './utils/formatters';
import { Header } from './components/Header';
import { HeroBalance } from './components/HeroBalance';
import { QuickActions } from './components/QuickActions';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { SettleModal } from './components/SettleModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { Plus } from 'lucide-react';

export function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [activeTab, setActiveTab] = useState<'activity' | 'analytics'>('activity');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [initialSplit, setInitialSplit] = useState<SplitType>('equal_split');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync state to local storage on change
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync theme to root and body class
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
    } else {
      root.classList.add('dark');
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
    }
  }, [state.theme]);

  // Toggle user perspective (Viewing as Alex vs Sam)
  const handleTogglePerspective = () => {
    setState((prev) => ({
      ...prev,
      activeUserId: prev.activeUserId === prev.user1.id ? prev.user2.id : prev.user1.id,
    }));
  };

  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Open Add modal with preset
  const handleOpenAddWithPreset = (preset?: SplitType) => {
    setEditingTransaction(null);
    setInitialSplit(preset || 'equal_split');
    setIsAddOpen(true);
  };

  // Save new or edited transaction
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingTransaction) {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...txData,
                id: t.id,
                time: t.time || timeStr,
                createdAt: t.createdAt,
              }
            : t
        ),
      }));
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'tx_' + Date.now(),
        time: timeStr,
        createdAt: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
    }
  };

  // Record a settlement
  const handleSettle = (amount: number, paidBy: string, beneficiaryId: string, note: string) => {
    const now = new Date();
    const roundedAmount = Math.round(amount * 100) / 100;
    const settleTx: Transaction = {
      id: 'settle_' + Date.now(),
      title: 'Settled Balance',
      amount: roundedAmount,
      paidBy,
      payerOwedAmount: roundedAmount,
      beneficiaryId,
      splitType: 'you_paid_full',
      category: 'settlement',
      date: getLocalDateString(now),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note.trim() || 'Settled up',
      isSettlement: true,
      createdAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      transactions: [settleTx, ...prev.transactions],
    }));
  };

  // Reset sample data
  const handleResetSampleData = () => {
    if (window.confirm('Reset all transactions to realistic sample demo data?')) {
      setState((prev) => ({
        ...prev,
        transactions: getFreshSampleTransactions(),
      }));
      setIsSettingsOpen(false);
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (window.confirm('Clear all transactions? This cannot be undone.')) {
      setState((prev) => ({
        ...prev,
        transactions: [],
      }));
      setIsSettingsOpen(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        state.theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      } transition-colors duration-300 pb-20`}
    >
      {/* Top App Header */}
      <Header
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTogglePerspective={handleTogglePerspective}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-5 pb-10">
        {/* Hero Card: Net Balance & Settle/Share */}
        <HeroBalance
          state={state}
          onOpenSettle={() => setIsSettleOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
        />

        {/* Quick Actions (Lend, Split 50/50, Borrow, Loan) */}
        <QuickActions state={state} onOpenAddModal={handleOpenAddWithPreset} />

        {/* Tab View: Activity vs Analytics */}
        {activeTab === 'activity' ? (
          <TransactionList
            state={state}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsAddOpen(true);
            }}
            onDelete={handleDeleteTransaction}
            onAddNew={() => handleOpenAddWithPreset('equal_split')}
          />
        ) : (
          <AnalyticsView state={state} />
        )}
      </main>

      {/* Floating Action Button for Mobile quick-add */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => handleOpenAddWithPreset('equal_split')}
          title="Add new expense or lending"
          className="flex items-center gap-2 p-4 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-2xl shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        state={state}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        initialSplitType={initialSplit}
      />

      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        state={state}
        onSettle={handleSettle}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        state={state}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateState={(partial) => setState((prev) => ({ ...prev, ...partial }))}
        onResetSampleData={handleResetSampleData}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

export default App;
