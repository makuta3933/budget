import { useState, useRef } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useTransactionContext } from '../contexts/TransactionContext';

export default function ExportView() {
    const { exportToJSON, exportToCSV, importFromJSON, clearAll, transactions } = useTransactionContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleExportJSON = () => {
        const json = exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simple-kakeibo-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showMessage('success', 'JSONファイルをエクスポートしました');
    };

    const handleExportCSV = () => {
        const csv = exportToCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simple-kakeibo-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showMessage('success', 'CSVファイルをエクスポートしました');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const result = importFromJSON(content);
            showMessage(result.success ? 'success' : 'error', result.message);
        };
        reader.onerror = () => {
            showMessage('error', 'ファイルの読み込みに失敗しました');
        };
        reader.readAsText(file);

        // Reset input
        e.target.value = '';
    };

    const handleClearAllConfirm = () => {
        clearAll();
        setShowClearConfirm(false);
        showMessage('success', '全データを削除しました');
    };

    return (
        <div className="space-y-4">
            {/* データ件数 */}
            <div className="card">
                <h3 className="font-medium mb-2">データ管理</h3>
                <p className="text-sm text-muji-muted">
                    現在 <span className="font-medium text-muji-text">{transactions.length}</span> 件の記録があります
                </p>
            </div>

            {/* エクスポート */}
            <div className="card">
                <h3 className="font-medium mb-4">エクスポート</h3>
                <div className="space-y-3">
                    <button
                        onClick={handleExportJSON}
                        disabled={transactions.length === 0}
                        className="w-full flex items-center gap-3 p-3 border border-muji-border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileJson className="w-5 h-5 text-muji-income" />
                        <div className="text-left">
                            <div className="font-medium">JSONでエクスポート</div>
                            <div className="text-xs text-muji-muted">バックアップ・復元用</div>
                        </div>
                        <Download className="w-4 h-4 ml-auto text-muji-muted" />
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={transactions.length === 0}
                        className="w-full flex items-center gap-3 p-3 border border-muji-border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileSpreadsheet className="w-5 h-5 text-muji-income" />
                        <div className="text-left">
                            <div className="font-medium">CSVでエクスポート</div>
                            <div className="text-xs text-muji-muted">Excel等での分析用（UTF-8 BOM付き）</div>
                        </div>
                        <Download className="w-4 h-4 ml-auto text-muji-muted" />
                    </button>
                </div>
            </div>

            {/* インポート */}
            <div className="card">
                <h3 className="font-medium mb-4">インポート</h3>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={handleImportClick}
                    className="w-full flex items-center gap-3 p-3 border border-muji-border rounded-md hover:bg-gray-50 transition-colors"
                >
                    <Upload className="w-5 h-5 text-muji-income" />
                    <div className="text-left">
                        <div className="font-medium">JSONからインポート</div>
                        <div className="text-xs text-muji-muted">バックアップファイルから復元</div>
                    </div>
                </button>
                <p className="text-xs text-muji-muted mt-2">
                    ※ インポートすると現在のデータは上書きされます
                </p>
            </div>

            {/* データ削除 */}
            <div className="card border-muji-expense/30">
                <h3 className="font-medium mb-4 text-muji-expense">危険な操作</h3>
                {!showClearConfirm ? (
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        disabled={transactions.length === 0}
                        className="w-full flex items-center gap-3 p-3 border border-muji-expense/30 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-5 h-5 text-muji-expense" />
                        <div className="text-left">
                            <div className="font-medium text-muji-expense">全データを削除</div>
                            <div className="text-xs text-muji-muted">すべての記録を削除します（元に戻せません）</div>
                        </div>
                    </button>
                ) : (
                    <div className="p-3 border border-muji-expense rounded-md bg-red-50">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-muji-expense" />
                            <span className="font-medium text-muji-expense">本当に削除しますか？</span>
                        </div>
                        <p className="text-sm text-muji-muted mb-3">
                            全{transactions.length}件のデータが削除されます。この操作は元に戻せません。
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleClearAllConfirm}
                                className="flex-1 bg-muji-expense text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                                削除する
                            </button>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 bg-white border border-muji-border py-2 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* メッセージ */}
            {message && (
                <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50 ${message.type === 'success' ? 'bg-muji-text text-white' : 'bg-muji-expense text-white'
                    }`}>
                    {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
