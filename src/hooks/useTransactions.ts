import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { Transaction, DailySummary, MonthlySummary, CategorySummary } from '../types';
import { STORAGE_KEY, getCategoryById, CATEGORIES } from '../constants';
import { validateTransactions, validateExportData } from '../schemas';

// UUID生成
const generateUUID = (): string => {
    return crypto.randomUUID();
};

// LocalStorageからデータを読み込み
const loadFromStorage = (): Transaction[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        const result = validateTransactions(parsed);

        if (!result.success) {
            console.warn('LocalStorageのデータが不正です:', result.error);
            return [];
        }

        return result.data;
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        return [];
    }
};

// LocalStorageにデータを保存
const saveToStorage = (transactions: Transaction[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
        console.error('データの保存に失敗しました:', error);
    }
};

export interface UseTransactionsReturn {
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
    updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => boolean;
    deleteTransaction: (id: string) => boolean;
    getTransactionsByDate: (date: string) => Transaction[];
    getTransactionsByMonth: (yearMonth: string) => Transaction[];
    getDailySummaries: (yearMonth: string) => Record<string, DailySummary>;
    getMonthlySummary: (yearMonth: string) => MonthlySummary;
    getMonthlyTrend: (months: number) => MonthlySummary[];
    getCategorySummaries: (yearMonth: string) => CategorySummary[];
    exportToJSON: () => string;
    exportToCSV: () => string;
    importFromJSON: (jsonString: string) => { success: boolean; message: string };
    clearAll: () => void;
}

export function useTransactions(): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // 初期読み込み
    useEffect(() => {
        const loaded = loadFromStorage();
        setTransactions(loaded);
    }, []);

    // 変更時に保存
    useEffect(() => {
        if (transactions.length > 0 || localStorage.getItem(STORAGE_KEY)) {
            saveToStorage(transactions);
        }
    }, [transactions]);

    // トランザクション追加
    const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>): Transaction => {
        const newTransaction: Transaction = {
            ...transaction,
            id: generateUUID(),
        };
        setTransactions(prev => [...prev, newTransaction]);
        return newTransaction;
    }, []);

    // トランザクション更新
    const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>): boolean => {
        let found = false;
        setTransactions(prev => prev.map(t => {
            if (t.id === id) {
                found = true;
                return { ...t, ...updates };
            }
            return t;
        }));
        return found;
    }, []);

    // トランザクション削除
    const deleteTransaction = useCallback((id: string): boolean => {
        let found = false;
        setTransactions(prev => {
            const filtered = prev.filter(t => {
                if (t.id === id) {
                    found = true;
                    return false;
                }
                return true;
            });
            return filtered;
        });
        return found;
    }, []);

    // 日付でフィルタ
    const getTransactionsByDate = useCallback((date: string): Transaction[] => {
        return transactions.filter(t => t.date === date);
    }, [transactions]);

    // 月でフィルタ
    const getTransactionsByMonth = useCallback((yearMonth: string): Transaction[] => {
        return transactions.filter(t => t.date.startsWith(yearMonth));
    }, [transactions]);

    // 日ごとの収支サマリー
    const getDailySummaries = useCallback((yearMonth: string): Record<string, DailySummary> => {
        const summaries: Record<string, DailySummary> = {};
        const monthTransactions = getTransactionsByMonth(yearMonth);

        monthTransactions.forEach(t => {
            if (!summaries[t.date]) {
                summaries[t.date] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                summaries[t.date].income += t.amount;
            } else {
                summaries[t.date].expense += t.amount;
            }
        });

        return summaries;
    }, [getTransactionsByMonth]);

    // 月間サマリー
    const getMonthlySummary = useCallback((yearMonth: string): MonthlySummary => {
        const monthTransactions = getTransactionsByMonth(yearMonth);

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return { month: yearMonth, income, expense };
    }, [getTransactionsByMonth]);

    // 月別推移（直近N月）
    const getMonthlyTrend = useCallback((months: number): MonthlySummary[] => {
        const result: MonthlySummary[] = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = subMonths(now, i);
            const yearMonth = format(date, 'yyyy-MM');
            result.push(getMonthlySummary(yearMonth));
        }

        return result;
    }, [getMonthlySummary]);

    // カテゴリ別サマリー
    const getCategorySummaries = useCallback((yearMonth: string): CategorySummary[] => {
        const monthTransactions = getTransactionsByMonth(yearMonth);
        const categoryTotals: Record<string, number> = {};

        monthTransactions.forEach(t => {
            if (!categoryTotals[t.categoryId]) {
                categoryTotals[t.categoryId] = 0;
            }
            categoryTotals[t.categoryId] += t.amount;
        });

        return Object.entries(categoryTotals).map(([categoryId, amount]) => {
            const category = getCategoryById(categoryId);
            return {
                categoryId,
                categoryName: category?.name || 'Unknown',
                amount,
                type: category?.type || 'expense',
                expenseType: category?.expenseType,
            };
        });
    }, [getTransactionsByMonth]);

    // JSONエクスポート
    const exportToJSON = useCallback((): string => {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            transactions,
        };
        return JSON.stringify(exportData, null, 2);
    }, [transactions]);

    // CSVエクスポート（UTF-8 BOM付き）
    const exportToCSV = useCallback((): string => {
        const BOM = '\uFEFF';
        const headers = ['日付', 'タイプ', 'カテゴリ', '金額', 'メモ'];
        const rows = transactions.map(t => {
            const category = getCategoryById(t.categoryId);
            return [
                t.date,
                t.type === 'income' ? '収入' : '支出',
                category?.name || t.categoryId,
                t.amount.toString(),
                t.note || '',
            ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
        });

        return BOM + [headers.join(','), ...rows].join('\n');
    }, [transactions]);

    // JSONインポート
    const importFromJSON = useCallback((jsonString: string): { success: boolean; message: string } => {
        try {
            const parsed = JSON.parse(jsonString);
            const result = validateExportData(parsed);

            if (!result.success) {
                return {
                    success: false,
                    message: 'データ形式が不正です: ' + result.error.message
                };
            }

            setTransactions(result.data.transactions);
            return {
                success: true,
                message: `${result.data.transactions.length}件のデータをインポートしました`
            };
        } catch (error) {
            return {
                success: false,
                message: 'JSONの解析に失敗しました'
            };
        }
    }, []);

    // 全データ削除
    const clearAll = useCallback((): void => {
        setTransactions([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByDate,
        getTransactionsByMonth,
        getDailySummaries,
        getMonthlySummary,
        getMonthlyTrend,
        getCategorySummaries,
        exportToJSON,
        exportToCSV,
        importFromJSON,
        clearAll,
    };
}
