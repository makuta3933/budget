import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2, Edit2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useTransactionContext } from '../contexts/TransactionContext';
import { getCategoryById } from '../constants';
import type { Transaction } from '../types';

export default function CalendarView() {
    const { getTransactionsByDate, getDailySummaries, deleteTransaction, updateTransaction } = useTransactionContext();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');

    const yearMonth = format(currentMonth, 'yyyy-MM');
    const dailySummaries = getDailySummaries(yearMonth);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('ja-JP');
    };

    const selectedTransactions = selectedDate ? getTransactionsByDate(selectedDate) : [];

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

    const handleEditCancel = () => {
        setEditingId(null);
        setEditAmount('');
    };

    return (
        <div className="card">
            {/* ヘッダー（月ナビゲーション） */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <ChevronLeft className="w-5 h-5 text-muji-muted" />
                </button>
                <h2 className="text-lg font-medium">
                    {format(currentMonth, 'yyyy年 M月', { locale: ja })}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <ChevronRight className="w-5 h-5 text-muji-muted" />
                </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day, idx) => (
                    <div
                        key={day}
                        className={`text-center text-sm py-2 ${idx === 0 ? 'text-muji-expense' : idx === 6 ? 'text-muji-income' : 'text-muji-muted'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7 gap-px bg-muji-border">
                {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-muji-bg min-h-[70px]" />
                ))}

                {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const data = dailySummaries[dateKey];
                    const dayOfWeek = getDay(day);

                    return (
                        <div
                            key={dateKey}
                            onClick={() => setSelectedDate(dateKey)}
                            className={`bg-white min-h-[70px] p-1 cursor-pointer hover:bg-gray-50 transition-colors ${!isSameMonth(day, currentMonth) ? 'opacity-40' : ''
                                } ${selectedDate === dateKey ? 'ring-2 ring-muji-text ring-inset' : ''}`}
                        >
                            <div className={`text-sm mb-1 ${isToday(day)
                                    ? 'bg-muji-text text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto'
                                    : dayOfWeek === 0 ? 'text-muji-expense' : dayOfWeek === 6 ? 'text-muji-income' : ''
                                }`}>
                                {format(day, 'd')}
                            </div>
                            {data && (
                                <div className="text-xs space-y-0.5">
                                    {data.income > 0 && (
                                        <div className="text-muji-income truncate">+{formatAmount(data.income)}</div>
                                    )}
                                    {data.expense > 0 && (
                                        <div className="text-muji-expense truncate">-{formatAmount(data.expense)}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 詳細モーダル */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDate(null)}>
                    <div className="bg-white rounded-md max-w-md w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-muji-border sticky top-0 bg-white">
                            <h3 className="font-medium">
                                {format(new Date(selectedDate), 'yyyy年M月d日(E)', { locale: ja })}
                            </h3>
                            <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {selectedTransactions.length > 0 ? (
                                <ul className="space-y-3">
                                    {selectedTransactions.map((item) => {
                                        const category = getCategoryById(item.categoryId);
                                        const isEditing = editingId === item.id;

                                        return (
                                            <li key={item.id} className="py-2 border-b border-muji-border last:border-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{category?.name || item.categoryId}</div>
                                                        {item.note && <div className="text-sm text-muji-muted">{item.note}</div>}
                                                    </div>
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={editAmount}
                                                                onChange={(e) => setEditAmount(e.target.value)}
                                                                className="w-24 px-2 py-1 border border-muji-border rounded text-right"
                                                                min="1"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleEditSave(item.id)}
                                                                className="text-muji-income hover:underline text-sm"
                                                            >
                                                                保存
                                                            </button>
                                                            <button
                                                                onClick={handleEditCancel}
                                                                className="text-muji-muted hover:underline text-sm"
                                                            >
                                                                キャンセル
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-medium ${item.type === 'income' ? 'text-muji-income' : 'text-muji-expense'}`}>
                                                                {item.type === 'income' ? '+' : '-'}¥{formatAmount(item.amount)}
                                                            </span>
                                                            <button
                                                                onClick={() => handleEditStart(item)}
                                                                className="p-1 hover:bg-gray-100 rounded text-muji-muted"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-1 hover:bg-gray-100 rounded text-muji-expense"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-center text-muji-muted py-8">この日の記録はありません</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
