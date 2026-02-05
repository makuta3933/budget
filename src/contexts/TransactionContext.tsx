import { createContext, useContext, ReactNode } from 'react';
import { useTransactions, UseTransactionsReturn } from '../hooks/useTransactions';

const TransactionContext = createContext<UseTransactionsReturn | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const transactions = useTransactions();

    return (
        <TransactionContext.Provider value={transactions}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactionContext(): UseTransactionsReturn {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactionContext must be used within a TransactionProvider');
    }
    return context;
}
