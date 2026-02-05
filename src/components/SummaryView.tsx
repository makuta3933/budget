import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useTransactionContext } from '../contexts/TransactionContext';
import { CHART_COLORS } from '../constants';

export default function SummaryView() {
    const { getMonthlySummary, getMonthlyTrend, getCategorySummaries } = useTransactionContext();

    const currentYearMonth = format(new Date(), 'yyyy-MM');
    const summary = getMonthlySummary(currentYearMonth);
    const trend = getMonthlyTrend(6);
    const categorySummaries = getCategorySummaries(currentYearMonth);

    const totalIncome = summary.income;
    const totalExpense = summary.expense;
    const balance = totalIncome - totalExpense;

    // 支出のカテゴリ別データを作成
    const expenseCategories = categorySummaries.filter(c => c.type === 'expense');
    const fixedTotal = expenseCategories
        .filter(c => c.expenseType === 'fixed')
        .reduce((sum, c) => sum + c.amount, 0);
    const variableTotal = expenseCategories
        .filter(c => c.expenseType === 'variable')
        .reduce((sum, c) => sum + c.amount, 0);

    // 円グラフ用データ
    const pieData = expenseCategories.map((c, idx) => ({
        name: c.categoryName,
        value: c.amount,
        color: c.expenseType === 'fixed'
            ? CHART_COLORS.fixed[idx % CHART_COLORS.fixed.length]
            : CHART_COLORS.variable[idx % CHART_COLORS.variable.length],
    }));

    // 棒グラフ用データ
    const barData = trend.map(t => ({
        month: format(new Date(t.month + '-01'), 'M月', { locale: ja }),
        income: t.income,
        expense: t.expense,
    }));

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('ja-JP');
    };

    const hasData = totalIncome > 0 || totalExpense > 0;

    return (
        <div className="space-y-4">
            {/* 収支サマリーカード */}
            <div className="grid grid-cols-3 gap-3">
                <div className="card text-center">
                    <div className="flex justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-muji-income" />
                    </div>
                    <p className="text-xs text-muji-muted mb-1">今月の収入</p>
                    <p className="text-lg font-bold text-muji-income">¥{formatAmount(totalIncome)}</p>
                </div>
                <div className="card text-center">
                    <div className="flex justify-center mb-2">
                        <TrendingDown className="w-5 h-5 text-muji-expense" />
                    </div>
                    <p className="text-xs text-muji-muted mb-1">今月の支出</p>
                    <p className="text-lg font-bold text-muji-expense">¥{formatAmount(totalExpense)}</p>
                </div>
                <div className="card text-center">
                    <div className="flex justify-center mb-2">
                        <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-muji-income' : 'text-muji-expense'}`} />
                    </div>
                    <p className="text-xs text-muji-muted mb-1">収支差額</p>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-muji-income' : 'text-muji-expense'}`}>
                        {balance >= 0 ? '+' : ''}¥{formatAmount(balance)}
                    </p>
                </div>
            </div>

            {/* データがない場合のメッセージ */}
            {!hasData && (
                <div className="card text-center py-8">
                    <p className="text-muji-muted">今月のデータはまだありません</p>
                    <p className="text-sm text-muji-muted mt-1">「入力」タブから収支を登録してください</p>
                </div>
            )}

            {/* 固定費・変動費の内訳 */}
            {totalExpense > 0 && (
                <div className="card">
                    <h3 className="font-medium mb-4">支出内訳</h3>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 bg-amber-50 rounded-md p-3 text-center">
                            <p className="text-xs text-muji-muted mb-1">固定費</p>
                            <p className="font-bold text-amber-700">¥{formatAmount(fixedTotal)}</p>
                            <p className="text-xs text-muji-muted">
                                ({totalExpense > 0 ? Math.round(fixedTotal / totalExpense * 100) : 0}%)
                            </p>
                        </div>
                        <div className="flex-1 bg-emerald-50 rounded-md p-3 text-center">
                            <p className="text-xs text-muji-muted mb-1">変動費</p>
                            <p className="font-bold text-emerald-700">¥{formatAmount(variableTotal)}</p>
                            <p className="text-xs text-muji-muted">
                                ({totalExpense > 0 ? Math.round(variableTotal / totalExpense * 100) : 0}%)
                            </p>
                        </div>
                    </div>

                    {/* 円グラフ */}
                    {pieData.length > 0 && (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `¥${formatAmount(value)}`} />
                                    <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* 月別推移グラフ */}
            {trend.some(t => t.income > 0 || t.expense > 0) && (
                <div className="card">
                    <h3 className="font-medium mb-4">収支推移（直近6ヶ月）</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => value >= 10000 ? `${value / 10000}万` : value.toString()}
                                />
                                <Tooltip formatter={(value: number) => `¥${formatAmount(value)}`} />
                                <Legend />
                                <Bar dataKey="income" name="収入" fill="#2D4C76" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="支出" fill="#BF0000" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
