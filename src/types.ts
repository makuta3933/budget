// 収支タイプ
export type TransactionType = 'income' | 'expense';

// 支出費目タイプ（収入の場合はnullまたは無視）
export type ExpenseType = 'fixed' | 'variable';

// カテゴリ定義インターフェース
export interface CategoryDef {
    id: string;
    name: string;
    type: TransactionType;
    expenseType?: ExpenseType; // 支出の場合のみ設定
}

// トランザクション（収支記録）
export interface Transaction {
    id: string;          // UUID
    date: string;        // YYYY-MM-DD
    amount: number;      // 金額
    type: TransactionType; // 収入 or 支出
    categoryId: string;  // カテゴリID（CategoryDefと紐付け）
    note?: string;       // メモ（任意）
}

// 日ごとの収支サマリー
export interface DailySummary {
    income: number;
    expense: number;
}

// 月ごとの収支サマリー
export interface MonthlySummary {
    month: string; // YYYY-MM
    income: number;
    expense: number;
}

// カテゴリ別集計
export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    amount: number;
    type: TransactionType;
    expenseType?: ExpenseType;
}
