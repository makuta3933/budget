import type { CategoryDef } from './types';

// カテゴリ定数（仕様書通り）
export const CATEGORIES: CategoryDef[] = [
    // --- 収入 ---
    { id: 'salary', name: '給与', type: 'income' },
    { id: 'bonus', name: '賞与', type: 'income' },
    { id: 'side_job', name: '副業', type: 'income' },
    { id: 'other_income', name: 'その他収入', type: 'income' },
    // --- 固定費 ---
    { id: 'housing', name: '家賃/住宅ローン', type: 'expense', expenseType: 'fixed' },
    { id: 'utilities', name: '水道光熱費', type: 'expense', expenseType: 'fixed' },
    { id: 'communication', name: '通信費', type: 'expense', expenseType: 'fixed' },
    { id: 'subscription', name: 'サブスク・保険', type: 'expense', expenseType: 'fixed' },
    // --- 変動費 ---
    { id: 'food', name: '食費', type: 'expense', expenseType: 'variable' },
    { id: 'daily', name: '日用品', type: 'expense', expenseType: 'variable' },
    { id: 'transport', name: '交通費', type: 'expense', expenseType: 'variable' },
    { id: 'fashion', name: '衣服・美容', type: 'expense', expenseType: 'variable' },
    { id: 'social', name: '交際費', type: 'expense', expenseType: 'variable' },
    { id: 'hobby', name: '趣味・娯楽', type: 'expense', expenseType: 'variable' },
    { id: 'other_expense', name: 'その他支出', type: 'expense', expenseType: 'variable' },
];

// カテゴリIDからカテゴリ情報を取得
export const getCategoryById = (id: string): CategoryDef | undefined => {
    return CATEGORIES.find(cat => cat.id === id);
};

// 収入カテゴリのみ取得
export const getIncomeCategories = (): CategoryDef[] => {
    return CATEGORIES.filter(cat => cat.type === 'income');
};

// 支出カテゴリのみ取得
export const getExpenseCategories = (): CategoryDef[] => {
    return CATEGORIES.filter(cat => cat.type === 'expense');
};

// 固定費カテゴリのみ取得
export const getFixedExpenseCategories = (): CategoryDef[] => {
    return CATEGORIES.filter(cat => cat.type === 'expense' && cat.expenseType === 'fixed');
};

// 変動費カテゴリのみ取得
export const getVariableExpenseCategories = (): CategoryDef[] => {
    return CATEGORIES.filter(cat => cat.type === 'expense' && cat.expenseType === 'variable');
};

// LocalStorageキー
export const STORAGE_KEY = 'simple-kakeibo-transactions';

// 円グラフのカラーパレット
export const CHART_COLORS = {
    fixed: [
        '#8B4513', // 茶色系（固定費用）
        '#A0522D',
        '#CD853F',
        '#DEB887',
    ],
    variable: [
        '#6B8E23', // 緑系（変動費用）
        '#556B2F',
        '#2E8B57',
        '#3CB371',
        '#20B2AA',
        '#5F9EA0',
        '#4682B4',
    ],
};
