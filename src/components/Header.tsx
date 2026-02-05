import { Wallet } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white border-b border-muji-border">
            <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-muji-text" />
                    <h1 className="text-xl font-medium text-muji-text">Simple Kakeibo</h1>
                </div>
                <p className="text-sm text-muji-muted mt-1">シンプル家計簿</p>
            </div>
        </header>
    );
}
