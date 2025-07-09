import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveToStorage, loadFromStorage } from '../../utils/storage';

export interface Budget {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number; // percentage (e.g., 80 for 80%)
}

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: loadFromStorage('budgets') || [
    {
      id: '1',
      category: 'Food',
      budgetAmount: 800,
      spentAmount: 650,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      alertThreshold: 80,
    },
    {
      id: '2',
      category: 'Transport',
      budgetAmount: 300,
      spentAmount: 420,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      alertThreshold: 80,
    },
    {
      id: '3',
      category: 'Entertainment',
      budgetAmount: 200,
      spentAmount: 150,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      alertThreshold: 80,
    },
    {
      id: '4',
      category: 'Shopping',
      budgetAmount: 500,
      spentAmount: 680,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      alertThreshold: 80,
    },
    {
      id: '5',
      category: 'Bills',
      budgetAmount: 1200,
      spentAmount: 1150,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      alertThreshold: 90,
    },
    {
      id: '6',
      category: 'Healthcare',
      budgetAmount: 400,
      spentAmount: 120,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      alertThreshold: 80,
    },
  ],
  loading: false,
  error: null,
};

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    addBudget: (state, action: PayloadAction<Omit<Budget, 'id' | 'spentAmount'>>) => {
      const newBudget: Budget = {
        id: Date.now().toString(),
        spentAmount: 0,
        ...action.payload,
      };
      state.budgets.push(newBudget);
      saveToStorage('budgets', state.budgets);
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
        saveToStorage('budgets', state.budgets);
      }
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(b => b.id !== action.payload);
      saveToStorage('budgets', state.budgets);
    },
    updateSpentAmount: (state, action: PayloadAction<{ category: string; amount: number }>) => {
      const budget = state.budgets.find(b => b.category === action.payload.category);
      if (budget) {
        budget.spentAmount += action.payload.amount;
        saveToStorage('budgets', state.budgets);
      }
    },
    resetBudgetPeriod: (state, action: PayloadAction<string>) => {
      const budget = state.budgets.find(b => b.id === action.payload);
      if (budget) {
        budget.spentAmount = 0;
        // Update dates for new period
        const now = new Date();
        budget.startDate = now.toISOString().split('T')[0];
        
        if (budget.period === 'monthly') {
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          budget.endDate = nextMonth.toISOString().split('T')[0];
        } else if (budget.period === 'weekly') {
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          budget.endDate = nextWeek.toISOString().split('T')[0];
        } else if (budget.period === 'yearly') {
          const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          budget.endDate = nextYear.toISOString().split('T')[0];
        }
        
        saveToStorage('budgets', state.budgets);
      }
    },
    clearBudgets: (state) => {
      state.budgets = [];
      saveToStorage('budgets', state.budgets);
    },
  },
});

export const {
  addBudget,
  updateBudget,
  deleteBudget,
  updateSpentAmount,
  resetBudgetPeriod,
  clearBudgets,
} = budgetsSlice.actions;

// Selectors
export const selectAllBudgets = (state: { budgets: BudgetsState }) => 
  state.budgets.budgets;

export const selectBudgetByCategory = (state: { budgets: BudgetsState }, category: string) =>
  state.budgets.budgets.find(b => b.category === category);

export const selectOverBudgetCategories = (state: { budgets: BudgetsState }) =>
  state.budgets.budgets.filter(b => b.spentAmount > b.budgetAmount);

export const selectBudgetAlerts = (state: { budgets: BudgetsState }) =>
  state.budgets.budgets.filter(b => 
    (b.spentAmount / b.budgetAmount) * 100 >= b.alertThreshold
  );

export const selectTotalBudget = (state: { budgets: BudgetsState }) =>
  state.budgets.budgets.reduce((total, budget) => total + budget.budgetAmount, 0);

export const selectTotalSpent = (state: { budgets: BudgetsState }) =>
  state.budgets.budgets.reduce((total, budget) => total + budget.spentAmount, 0);

export default budgetsSlice.reducer;

