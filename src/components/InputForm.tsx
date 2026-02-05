import { useState, useMemo } from 'react';
import { CalendarDays, Plus, Check, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useTransactionContext } from '../contexts/TransactionContext';
import { getIncomeCategories, getFixedExpenseCategories, getVariableExpenseCategories, getCategoryById } from '../constants';
import type { TransactionType, Transaction } from '../types';

export default function InputForm() {
    const { addTransaction, transactions, deleteTransaction, updateTransaction } = useTransactionContext();

    const [activeTab, setActiveTab] = useState<TransactionType>('expense');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');

    const incomeCategories = getIncomeCategories();
    const fixedCategories = getFixedExpenseCategories();
    const variableCategories = getVariableExpenseCategories();

    // 選択した日付の記録を取得
    const selectedDateTransactions = useMemo(() => {
        return transactions
            .filter(t => t.date === date)
            .sort((a, b) => b.id.localeCompare(a.id)); // 新しい順
    }, [transactions, date]);

    // 今日の合計
    const todayTotals = useMemo(() => {
        const income = selectedDateTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = selectedDateTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return { income, expense };
    }, [selectedDateTransactions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryId || !amount || Number(amount) <= 0) {
            return;
        }

        addTransaction({
            date,
            categoryId,
            amount: Number(amount),
            type: activeTab,
            note: note || undefined,
        });

        // トースト表示
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);

        // フォームリセット
        setCategoryId('');
        setAmount('');
        setNote('');
    };

    const handleTabChange = (tab: TransactionType) => {
        setActiveTab(tab);
        setCategoryId('');
    };

    const handleDelete = (id: string) => {
        if (confirm('この記録を削除しますか？')) {
            deleteTransaction(id);
        }
    };

    const handleEditStart = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setEditAmount(transaction.amount.toString());
    };

    const handleEditSave = (id: string) => {
        if (editAmount && Number(editAmount) > 0) {
            updateTransaction(id, { amount: Number(editAmount) });
        }
        setEditingId(null);
        setEditAmount('');
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('ja-JP');
    };

    return (
        <div className="space-y-4">
            {/* 入力フォーム */}
            <div className="card">
                {/* タブ切り替え */}
                <div className="flex border-b border-muji-border mb-4">
                    <button
                        type="button"
                        onClick={() => handleTabChange('expense')}
                        className={`flex-1 py-3 text-center transition-colors ${activeTab === 'expense' ? 'tab-active' : 'tab-inactive'
                            }`}
                    >
                        <span className={activeTab === 'expense' ? 'text-muji-expense' : ''}>支出</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('income')}
                        className={`flex-1 py-3 text-center transition-colors ${activeTab === 'income' ? 'tab-active' : 'tab-inactive'
                            }`}
                    >
                        <span className={activeTab === 'income' ? 'text-muji-income' : ''}>収入</span>
                    </button>
                </div>

                {/* 入力フォーム */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 日付 */}
                    <div>
                        <label className="block text-sm text-muji-muted mb-1">日付</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field pr-10"
                                required
                            />
                            <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muji-muted pointer-events-none" />
                        </div>
                    </div>

                    {/* カテゴリ */}
                    <div>
                        <label className="block text-sm text-muji-muted mb-1">カテゴリ</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="input-field"
                            required
                        >
                            <option value="">選択してください</option>
                            {activeTab === 'expense' && (
                                <>
                                    <optgroup label="固定費">
                                        {fixedCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="変動費">
                                        {variableCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </optgroup>
                                </>
                            )}
                            {activeTab === 'income' && incomeCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 金額 */}
                    <div>
                        <label className="block text-sm text-muji-muted mb-1">金額</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muji-muted">¥</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="input-field pl-8 text-right"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    {/* メモ */}
                    <div>
                        <label className="block text-sm text-muji-muted mb-1">メモ（任意）</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="メモを入力..."
                            className="input-field"
                        />
                    </div>

                    {/* 登録ボタン */}
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'expense'
                            ? 'bg-muji-expense text-white hover:bg-red-700'
                            : 'bg-muji-income text-white hover:bg-blue-800'
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        {activeTab === 'expense' ? '支出を登録' : '収入を登録'}
                    </button>
                </form>
            </div>

            {/* 選択した日付の記録一覧 */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                        {format(new Date(date), 'M月d日(E)', { locale: ja })}の記録
                    </h3>
                    <span className="text-sm text-muji-muted">
                        {selectedDateTransactions.length}件
                    </span>
                </div>

                {/* 合計表示 */}
                {(todayTotals.income > 0 || todayTotals.expense > 0) && (
                    <div className="flex gap-4 mb-3 pb-3 border-b border-muji-border">
                        {todayTotals.income > 0 && (
                            <div className="text-sm">
                                <span className="text-muji-muted">収入: </span>
                                <span className="text-muji-income font-medium">+¥{formatAmount(todayTotals.income)}</span>
                            </div>
                        )}
                        {todayTotals.expense > 0 && (
                            <div className="text-sm">
                                <span className="text-muji-muted">支出: </span>
                                <span className="text-muji-expense font-medium">-¥{formatAmount(todayTotals.expense)}</span>
                            </div>
                        )}
                    </div>
                )}

                {selectedDateTransactions.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedDateTransactions.map((item) => {
                            const category = getCategoryById(item.categoryId);
                            const isEditing = editingId === item.id;

                            return (
                                <li key={item.id} className="flex items-center justify-between py-2 border-b border-muji-border/50 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${item.type === 'income' ? 'bg-blue-50 text-muji-income' : 'bg-red-50 text-muji-expense'
                                                }`}>
                                                {item.type === 'income' ? '収入' : '支出'}
                                            </span>
                                            <span className="font-medium truncate">{category?.name || item.categoryId}</span>
                                        </div>
                                        {item.note && <div className="text-xs text-muji-muted truncate mt-0.5">{item.note}</div>}
                                    </div>

                                    {isEditing ? (
                                        <div className="flex items-center gap-2 ml-2">
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="w-20 px-2 py-1 border border-muji-border rounded text-right text-sm"
                                                min="1"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleEditSave(item.id)}
                                                className="text-muji-income hover:underline text-xs"
                                            >
                                                保存
                                            </button>
                                            <button
                                                onClick={() => { setEditingId(null); setEditAmount(''); }}
                                                className="text-muji-muted hover:underline text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 ml-2">
                                            <span className={`font-medium whitespace-nowrap ${item.type === 'income' ? 'text-muji-income' : 'text-muji-expense'}`}>
                                                {item.type === 'income' ? '+' : '-'}¥{formatAmount(item.amount)}
                                            </span>
                                            <button
                                                onClick={() => handleEditStart(item)}
                                                className="p-1 hover:bg-gray-100 rounded text-muji-muted"
                                                title="編集"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 hover:bg-gray-100 rounded text-muji-expense"
                                                title="削除"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-muji-muted text-sm py-4">この日の記録はありません</p>
                )}
            </div>

            {/* トースト通知 */}
            {showToast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-muji-text text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
                    <Check className="w-4 h-4" />
                    登録しました
                </div>
            )}
        </div>
    );
}
