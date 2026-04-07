// Logic extracted from App.tsx to manage complex interactions between stores
import { useFinanceStore } from '../store/useFinanceStore';
import { useUserStore } from '../store/useUserStore';
import { syncService } from '../services/syncService';
import { Transaction, Trip, Goal } from '../types';

export const useFinanceControllers = () => {
    const {
        transactions, accounts, goals,
        setTransactions, setAccounts, setGoals
    } = useFinanceStore();

    const { automationRules, addSyncLog } = useUserStore();

    const runAutomation = (trigger: string, payload: any) => {
        automationRules.filter(r => r.trigger === trigger && r.isActive).forEach(rule => {
            if (trigger === 'TRANSACTION_OVER_AMOUNT') {
                const tx = payload as Transaction;
                if (rule.threshold && tx.amount > rule.threshold) {
                    if (rule.action === 'SEND_ALERT') {
                        addSyncLog({ message: `⚠️ Alerta Automática: Gasto de ${tx.amount}€ supera el límite de ${rule.threshold}€`, timestamp: Date.now(), type: 'SYSTEM' });
                    }
                }
            }
            // Other rules...
        });
    };

    const addTransaction = async (newTransaction: Omit<Transaction, 'id'> & { id?: string }, isSync = false) => {
        const transaction: Transaction = {
            ...newTransaction,
            id: newTransaction.id || Math.random().toString(36).substr(2, 9)
        };

        if (transaction.type === 'EXPENSE') runAutomation('TRANSACTION_OVER_AMOUNT', transaction);

        setTransactions((prev) => [transaction, ...prev]);

        // Sync to cloud
        try {
            await syncService.saveTransaction(transaction);
        } catch (e) {
            console.error("Failed to sync new transaction:", e);
        }

        const selectedAccount = accounts.find(a => a.id === transaction.accountId);
        if (selectedAccount) {
            const amountImpact = transaction.type === 'INCOME' ? transaction.amount : -transaction.amount;

            setAccounts((prev) => prev.map(acc => {
                // ── DEBIT card ──────────────────────────────────────────────
                // Debit cards are a "window" to a bank account: the real balance
                // impact goes to the linked bank account, not the card itself.
                if (selectedAccount.type === 'DEBIT' && selectedAccount.linkedAccountId) {
                    if (acc.id === selectedAccount.linkedAccountId) {
                        const updated = { ...acc, balance: acc.balance + amountImpact };
                        syncService.saveAccount(updated).catch(e => console.error("Failed to sync account:", e));
                        return updated;
                    }
                    return acc;
                }

                // ── CREDIT card ─────────────────────────────────────────────
                // Credit cards accumulate debt on their own balance.
                // The linked bank account is NOT touched here — settlement happens
                // separately (via a transfer when the user pays the statement).
                if (selectedAccount.type === 'CREDIT' && acc.id === transaction.accountId) {
                    const newBalance = acc.balance + amountImpact; // gets more negative on expense
                    // Also track the current billing cycle statement (positive accumulator)
                    const cycleAccrued = (acc.statementBalance ?? 0) + (transaction.type === 'EXPENSE' ? transaction.amount : -transaction.amount);
                    const updated = {
                        ...acc,
                        balance: newBalance,
                        statementBalance: Math.max(0, cycleAccrued)
                    };
                    syncService.saveAccount(updated).catch(e => console.error("Failed to sync account:", e));
                    return updated;
                }

                // ── All other account types (BANK, CASH, WALLET, ASSET…) ────
                if (acc.id === transaction.accountId) {
                    const updated = { ...acc, balance: acc.balance + amountImpact };
                    syncService.saveAccount(updated).catch(e => console.error("Failed to sync account:", e));
                    return updated;
                }

                return acc;
            }));
        }

        if (isSync) addSyncLog({ message: `Gasto sincronizado: ${newTransaction.description} (${newTransaction.amount}€)`, timestamp: Date.now(), type: "FINANCE" });
        else {
            const recurrentMsg = transaction.isRecurring ? ` (Recurrente: ${transaction.frequency || 'Mensual'})` : '';
            addSyncLog({ message: `Nueva transacción registrada${recurrentMsg}`, timestamp: Date.now(), type: "FINANCE" });
        }
    };


    const transfer = async (fromAccountId: string, toAccountId: string, amount: number, date: string, goalId?: string, description?: string) => {
        const fromAccount = accounts.find(a => a.id === fromAccountId);
        const toAccount = accounts.find(a => a.id === toAccountId);
        if (!fromAccount || !toAccount) return;

        const outgoing: Transaction = { id: Math.random().toString(36).substr(2, 9), type: 'EXPENSE', amount, date, category: 'Transferencia', subCategory: 'Entre Cuentas', accountId: fromAccountId, description: description || `Transferencia a ${toAccount.name}` };
        const incoming: Transaction = { id: Math.random().toString(36).substr(2, 9), type: 'INCOME', amount, date, category: 'Transferencia', subCategory: 'Desde otra cuenta', accountId: toAccountId, description: description || `Recibido de ${fromAccount.name}` };

        setTransactions((prev) => [incoming, outgoing, ...prev]);

        // Sync transfers
        try {
            await Promise.all([
                syncService.saveTransaction(outgoing),
                syncService.saveTransaction(incoming)
            ]);
        } catch (err: any) {
            console.error("Failed to sync transfer transactions:", err);
        }

        setAccounts((prev) => prev.map(acc => {
            if (acc.id === fromAccountId) {
                const updated = { ...acc, balance: acc.balance - amount };
                syncService.saveAccount(updated).catch((err: any) => console.error("Failed to sync account:", err));
                return updated;
            }
            if (acc.id === toAccountId) {
                const updated = { ...acc, balance: acc.balance + amount };
                syncService.saveAccount(updated).catch((err: any) => console.error("Failed to sync account:", err));
                return updated;
            }
            return acc;
        }));

        if (goalId) {
            const goal = goals.find(g => g.id === goalId);
            if (goal) {
                const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
                setGoals((prev) => prev.map(g => g.id === goalId ? updatedGoal : g));
                syncService.saveGoal(updatedGoal).catch((err: any) => console.error("Failed to sync goal:", err));
                addSyncLog({ message: `Meta actualizada: ${goal.name} (+${amount}€)`, timestamp: Date.now(), type: "FINANCE" });
            }
        }
        addSyncLog({ message: `Traspaso exitoso: ${amount}€ de ${fromAccount.name} a ${toAccount.name}`, timestamp: Date.now(), type: "FINANCE" });
    };

    const editTransaction = async (updatedTransaction: Transaction) => {
        const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (!oldTransaction) return;

        const oldAccount = accounts.find(a => a.id === oldTransaction.accountId);
        const newAccount = accounts.find(a => a.id === updatedTransaction.accountId);



        setAccounts((prev) => prev.map(acc => {
            let newBalance = acc.balance;
            let newStatementBalance = acc.statementBalance;
            let changed = false;

            // Revert old transaction
            if (oldAccount?.type === 'DEBIT' && oldAccount.linkedAccountId) {
                if (acc.id === oldAccount.linkedAccountId) {
                    newBalance -= (oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount);
                    changed = true;
                }
            } else if (oldAccount?.type === 'CREDIT' && acc.id === oldTransaction.accountId) {
                newBalance -= (oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount);
                if (oldTransaction.type === 'EXPENSE') {
                    newStatementBalance = Math.max(0, (acc.statementBalance ?? 0) - oldTransaction.amount);
                }
                changed = true;
            } else if (acc.id === oldTransaction.accountId) {
                newBalance -= (oldTransaction.type === 'INCOME' ? oldTransaction.amount : -oldTransaction.amount);
                changed = true;
            }

            // Apply new transaction
            if (newAccount?.type === 'DEBIT' && newAccount.linkedAccountId) {
                if (acc.id === newAccount.linkedAccountId) {
                    newBalance += (updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount);
                    changed = true;
                }
            } else if (newAccount?.type === 'CREDIT' && acc.id === updatedTransaction.accountId) {
                newBalance += (updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount);
                if (updatedTransaction.type === 'EXPENSE') {
                    newStatementBalance = Math.max(0, (newStatementBalance ?? acc.statementBalance ?? 0) + updatedTransaction.amount);
                }
                changed = true;
            } else if (acc.id === updatedTransaction.accountId && newAccount?.type !== 'DEBIT') {
                newBalance += (updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount);
                changed = true;
            }

            if (changed) {
                const updatedAcc = { ...acc, balance: newBalance, statementBalance: newStatementBalance };
                syncService.saveAccount(updatedAcc).catch(err => console.error("Failed to sync account:", err));
                return updatedAcc;
            }
            return acc;
        }));

        setTransactions((prev) => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        syncService.saveTransaction(updatedTransaction).catch((err: any) => console.error("Failed to sync transaction:", err));

        addSyncLog({ message: `Transacción actualizada: ${updatedTransaction.description}`, timestamp: Date.now(), type: "FINANCE" });
    };

    const deleteTransaction = async (id: string) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        const account = accounts.find(a => a.id === transaction.accountId);

        setAccounts((prev) => prev.map(acc => {
            // DEBIT: revert on linked bank account
            if (account?.type === 'DEBIT' && account.linkedAccountId) {
                if (acc.id === account.linkedAccountId) {
                    const updated = { ...acc, balance: acc.balance - (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount) };
                    syncService.saveAccount(updated).catch((err: any) => console.error("Failed to sync account:", err));
                    return updated;
                }
                return acc;
            }
            // CREDIT: revert on card + statementBalance
            if (account?.type === 'CREDIT' && acc.id === transaction.accountId) {
                const newBalance = acc.balance - (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount) ;
                const newStatement = transaction.type === 'EXPENSE'
                    ? Math.max(0, (acc.statementBalance ?? 0) - transaction.amount)
                    : (acc.statementBalance ?? 0);
                const updated = { ...acc, balance: newBalance, statementBalance: newStatement };
                syncService.saveAccount(updated).catch((err: any) => console.error("Failed to sync account:", err));
                return updated;
            }
            // Other accounts
            if (acc.id === transaction.accountId) {
                const updated = { ...acc, balance: acc.balance - (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount) };
                syncService.saveAccount(updated).catch((err: any) => console.error("Failed to sync account:", err));
                return updated;
            }
            return acc;
        }));

        setTransactions((prev) => prev.filter(t => t.id !== id));
        syncService.deleteTransaction(id).catch((err: any) => console.error("Failed to sync deletion:", err));

        addSyncLog({ message: `Transacción eliminada: ${transaction.description}`, timestamp: Date.now(), type: "FINANCE" });
    };

    const addTransactionsBatch = async (newTxs: Transaction[]) => {
        if (newTxs.length === 0) return;

        // Add to local store
        setTransactions((prev) => [...newTxs, ...prev]);

        // Calculate balance impacts per account
        // We need to know which account ID's balance to touch for each transaction
        const finalAccountImpacts: Record<string, number> = {};
        const creditStatementImpacts: Record<string, number> = {};

        newTxs.forEach(tx => {
            const txAcc = accounts.find(a => a.id === tx.accountId);
            if (!txAcc) return;

            const impact = tx.type === 'INCOME' ? tx.amount : -tx.amount;
            
            if (txAcc.type === 'DEBIT' && txAcc.linkedAccountId) {
                // Impact goes to linked account
                finalAccountImpacts[txAcc.linkedAccountId] = (finalAccountImpacts[txAcc.linkedAccountId] || 0) + impact;
            } else if (txAcc.type === 'CREDIT') {
                // Impact goes to card balance
                finalAccountImpacts[txAcc.id] = (finalAccountImpacts[txAcc.id] || 0) + impact;
                // Also track statement impact
                const statementImpact = tx.type === 'EXPENSE' ? tx.amount : -tx.amount;
                creditStatementImpacts[txAcc.id] = (creditStatementImpacts[txAcc.id] || 0) + statementImpact;
            } else {
                // Standard impact
                finalAccountImpacts[txAcc.id] = (finalAccountImpacts[txAcc.id] || 0) + impact;
            }
        });

        // Update balances in a single state update
        setAccounts((prev) => prev.map(acc => {
            const balanceImpact = finalAccountImpacts[acc.id] || 0;
            const statementImpact = creditStatementImpacts[acc.id] || 0;

            if (balanceImpact === 0 && statementImpact === 0) return acc;

            const updated = { 
                ...acc, 
                balance: acc.balance + balanceImpact,
                statementBalance: acc.type === 'CREDIT' 
                    ? Math.max(0, (acc.statementBalance || 0) + statementImpact)
                    : acc.statementBalance
            };
            
            syncService.saveAccount(updated).catch(e => console.error("Failed to sync account batch update:", e));
            return updated;
        }));

        // Sync transactions to cloud in bulk
        try {
            await syncService.saveTransactionsBatch(newTxs);
        } catch (e) {
            console.error("Failed to sync transactions batch:", e);
        }

        addSyncLog({ 
            message: `Importación masiva completada: ${newTxs.length} transacciones`, 
            timestamp: Date.now(), 
            type: "FINANCE" 
        });
    };

    return {
        addTransaction,
        addTransactionsBatch,
        transfer,
        editTransaction,
        deleteTransaction
    };
};
