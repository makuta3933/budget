import { z } from 'zod';

// トランザクションタイプのスキーマ
export const TransactionTypeSchema = z.enum(['income', 'expense']);

// 支出費目タイプのスキーマ
export const ExpenseTypeSchema = z.enum(['fixed', 'variable']);

// トランザクションスキーマ（データ検証用）
export const TransactionSchema = z.object({
    id: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください'),
    amount: z.number().positive('金額は0より大きい値を入力してください'),
    type: TransactionTypeSchema,
    categoryId: z.string().min(1, 'カテゴリを選択してください'),
    note: z.string().optional(),
});

// トランザクション配列のスキーマ
export const TransactionsArraySchema = z.array(TransactionSchema);

// 入力フォーム用スキーマ（ID不要）
export const TransactionInputSchema = TransactionSchema.omit({ id: true });

// エクスポート用スキーマ（メタデータ付き）
export const ExportDataSchema = z.object({
    version: z.string(),
    exportedAt: z.string(),
    transactions: TransactionsArraySchema,
});

// 型のエクスポート
export type TransactionInput = z.infer<typeof TransactionInputSchema>;
export type ExportData = z.infer<typeof ExportDataSchema>;

// バリデーション関数
export const validateTransaction = (data: unknown) => {
    return TransactionSchema.safeParse(data);
};

export const validateTransactions = (data: unknown) => {
    return TransactionsArraySchema.safeParse(data);
};

export const validateExportData = (data: unknown) => {
    return ExportDataSchema.safeParse(data);
};
