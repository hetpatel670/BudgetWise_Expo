import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveToStorage, loadFromStorage } from '../../utils/storage';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: loadFromStorage('transactions') || [
    {
      id: '1',
      description: 'Salary Deposit',
      amount: 2600.00,
      type: 'income',
      category: 'Income',
      date: '2024-01-15',
      notes: 'Monthly salary'
    },
    {
      id: '2',
      description: 'Grocery Store',
      amount: -85.50,
      type: 'expense',
      category: 'Food',
      date: '2024-01-15',
      notes: 'Weekly groceries'
    },
    {
      id: '3',
      description: 'Gas Station',
      amount: -45.20,
      type: 'expense',
      category: 'Transport',
      date: '2024-01-14',
      notes: 'Fuel for car'
    },
    {
      id: '4',
      description: 'Coffee Shop',
      amount: -12.75,
      type: 'expense',
      category: 'Food',
      date: '2024-01-14',
      notes: 'Morning coffee'
    },
    {
      id: '5',
      description: 'Online Shopping',
      amount: -156.99,
      type: 'expense',
      category: 'Shopping',
      date: '2024-01-13',
      notes: 'Clothes and accessories'
    },
    {
      id: '6',
      description: 'Freelance Work',
      amount: 450.00,
      type: 'income',
      category: 'Income',
      date: '2024-01-12',
      notes: 'Web design project'
    },
    {
      id: '7',
      description: 'Electric Bill',
      amount: -89.30,
      type: 'expense',
      category: 'Bills',
      date: '2024-01-11',
      notes: 'Monthly electricity bill'
    },
    {
      id: '8',
      description: 'Restaurant',
      amount: -67.80,
      type: 'expense',
      category: 'Food',
      date: '2024-01-10',
      notes: 'Dinner with friends'
    }
  ],
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Omit<Transaction, 'id'>>) => {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.transactions.unshift(newTransaction);
      saveToStorage('transactions', state.transactions);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
        saveToStorage('transactions', state.transactions);
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      saveToStorage('transactions', state.transactions);
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      saveToStorage('transactions', state.transactions);
    },
    clearTransactions: (state) => {
      state.transactions = [];
      saveToStorage('transactions', state.transactions);
    },
  },
});

export const {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setTransactions,
  clearTransactions,
} = transactionsSlice.actions;

// Selectors
export const selectAllTransactions = (state: { transactions: TransactionsState }) => 
  state.transactions.transactions;

export const selectTransactionsByType = (state: { transactions: TransactionsState }, type: 'income' | 'expense') =>
  state.transactions.transactions.filter(t => t.type === type);

export const selectTransactionsByCategory = (state: { transactions: TransactionsState }, category: string) =>
  state.transactions.transactions.filter(t => t.category === category);

export const selectRecentTransactions = (state: { transactions: TransactionsState }, limit: number = 5) =>
  state.transactions.transactions.slice(0, limit);

export default transactionsSlice.reducer;

