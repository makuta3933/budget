import { useState } from 'react';
import { PenLine, Calendar, BarChart3, Download } from 'lucide-react';
import { TransactionProvider } from './contexts/TransactionContext';
import Header from './components/Header';
import InputForm from './components/InputForm';
import CalendarView from './components/CalendarView';
import SummaryView from './components/SummaryView';
import ExportView from './components/ExportView';

type TabType = 'input' | 'calendar' | 'summary' | 'export';

function AppContent() {
    const [activeTab, setActiveTab] = useState<TabType>('input');

    const tabs = [
        { id: 'input' as const, label: '入力', icon: PenLine },
        { id: 'calendar' as const, label: 'カレンダー', icon: Calendar },
        { id: 'summary' as const, label: '分析', icon: BarChart3 },
        { id: 'export' as const, label: '出力', icon: Download },
    ];

    return (
        <div className="min-h-screen bg-muji-bg">
            <Header />

            {/* メインコンテンツ */}
            <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
                {activeTab === 'input' && <InputForm />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'summary' && <SummaryView />}
                {activeTab === 'export' && <ExportView />}
            </main>

            {/* ボトムナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-muji-border">
                <div className="max-w-2xl mx-auto">
                    <div className="flex">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-muji-text' : 'text-muji-muted hover:text-muji-text'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                                    <span className="text-xs">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default function App() {
    return (
        <TransactionProvider>
            <AppContent />
        </TransactionProvider>
    );
}
