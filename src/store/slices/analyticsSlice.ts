import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveToStorage, loadFromStorage } from '../../utils/storage';

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  category?: string;
  date: string;
  dismissed: boolean;
}

export interface SpendingPattern {
  weeklyTrends: Array<{ week: string; amount: number }>;
  monthlyTrends: Array<{ month: string; amount: number }>;
  categoryTrends: Array<{ category: string; amount: number; percentage: number }>;
  lastUpdated: string | null;
}

export interface FinancialPrediction {
  nextMonthSpending: number;
  budgetRisk: Array<{ category: string; riskLevel: 'low' | 'medium' | 'high' }>;
  savingsProjection: number;
  lastUpdated: string | null;
}

export interface FinancialReport {
  id: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  topCategories: Array<{ category: string; amount: number }>;
  generatedAt: string;
}

interface AnalyticsState {
  insights: FinancialInsight[];
  spendingPatterns: SpendingPattern;
  predictions: FinancialPrediction;
  reports: {
    weekly: FinancialReport[];
    monthly: FinancialReport[];
    yearly: FinancialReport[];
  };
}

const initialState: AnalyticsState = {
  insights: loadFromStorage('insights') || [
    {
      id: '1',
      type: 'warning',
      title: 'Shopping Spending Alert',
      description: 'Your shopping expenses increased by 12% this month',
      action: 'Review recent purchases',
      category: 'Shopping',
      date: new Date().toISOString(),
      dismissed: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Savings Goal Progress',
      description: "You're 72% towards your emergency fund goal",
      action: 'Keep up the good work',
      category: 'Savings',
      date: new Date().toISOString(),
      dismissed: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Budget Optimization',
      description: 'Consider reducing entertainment budget by $50',
      action: 'Adjust budget',
      category: 'Budget',
      date: new Date().toISOString(),
      dismissed: false,
    },
  ],
  spendingPatterns: loadFromStorage('spendingPatterns') || {
    weeklyTrends: [
      { week: 'Week 1', amount: 120 },
      { week: 'Week 2', amount: 85 },
      { week: 'Week 3', amount: 200 },
      { week: 'Week 4', amount: 150 },
    ],
    monthlyTrends: [
      { month: 'Jan', amount: 3200 },
      { month: 'Feb', amount: 2800 },
      { month: 'Mar', amount: 3500 },
      { month: 'Apr', amount: 3100 },
    ],
    categoryTrends: [
      { category: 'Food', amount: 850, percentage: 22 },
      { category: 'Bills', amount: 1200, percentage: 31 },
      { category: 'Shopping', amount: 680, percentage: 18 },
      { category: 'Transport', amount: 420, percentage: 11 },
      { category: 'Entertainment', amount: 320, percentage: 8 },
      { category: 'Healthcare', amount: 180, percentage: 5 },
      { category: 'Others', amount: 200, percentage: 5 },
    ],
    lastUpdated: null,
  },
  predictions: loadFromStorage('predictions') || {
    nextMonthSpending: 3400,
    budgetRisk: [
      { category: 'Shopping', riskLevel: 'high' },
      { category: 'Transport', riskLevel: 'high' },
      { category: 'Bills', riskLevel: 'medium' },
      { category: 'Food', riskLevel: 'medium' },
    ],
    savingsProjection: 1350,
    lastUpdated: null,
  },
  reports: loadFromStorage('reports') || {
    weekly: [],
    monthly: [],
    yearly: [],
  },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    addInsight: (state, action: PayloadAction<Omit<FinancialInsight, 'id' | 'date' | 'dismissed'>>) => {
      const newInsight: FinancialInsight = {
        id: Date.now().toString(),
        ...action.payload,
        date: new Date().toISOString(),
        dismissed: false,
      };
      state.insights.unshift(newInsight);
      saveToStorage('insights', state.insights);
    },
    dismissInsight: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight) {
        insight.dismissed = true;
        saveToStorage('insights', state.insights);
      }
    },
    clearDismissedInsights: (state) => {
      state.insights = state.insights.filter(i => !i.dismissed);
      saveToStorage('insights', state.insights);
    },
    updateSpendingPatterns: (state, action: PayloadAction<Partial<SpendingPattern>>) => {
      state.spendingPatterns = {
        ...state.spendingPatterns,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      saveToStorage('spendingPatterns', state.spendingPatterns);
    },
    updatePredictions: (state, action: PayloadAction<Partial<FinancialPrediction>>) => {
      state.predictions = {
        ...state.predictions,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      saveToStorage('predictions', state.predictions);
    },
    generateReport: (state, action: PayloadAction<Omit<FinancialReport, 'id' | 'generatedAt'>>) => {
      const report: FinancialReport = {
        id: Date.now().toString(),
        ...action.payload,
        generatedAt: new Date().toISOString(),
      };
      
      if (report.period === 'weekly') {
        state.reports.weekly.unshift(report);
        if (state.reports.weekly.length > 12) {
          state.reports.weekly = state.reports.weekly.slice(0, 12);
        }
      } else if (report.period === 'monthly') {
        state.reports.monthly.unshift(report);
        if (state.reports.monthly.length > 12) {
          state.reports.monthly = state.reports.monthly.slice(0, 12);
        }
      } else if (report.period === 'yearly') {
        state.reports.yearly.unshift(report);
        if (state.reports.yearly.length > 5) {
          state.reports.yearly = state.reports.yearly.slice(0, 5);
        }
      }
      
      saveToStorage('reports', state.reports);
    },
    clearAnalyticsData: (state) => {
      state.insights = [];
      state.spendingPatterns = {
        weeklyTrends: [],
        monthlyTrends: [],
        categoryTrends: [],
        lastUpdated: null,
      };
      state.predictions = {
        nextMonthSpending: 0,
        budgetRisk: [],
        savingsProjection: 0,
        lastUpdated: null,
      };
      state.reports = { weekly: [], monthly: [], yearly: [] };
      
      saveToStorage('insights', state.insights);
      saveToStorage('spendingPatterns', state.spendingPatterns);
      saveToStorage('predictions', state.predictions);
      saveToStorage('reports', state.reports);
    },
  },
});

export const {
  addInsight,
  dismissInsight,
  clearDismissedInsights,
  updateSpendingPatterns,
  updatePredictions,
  generateReport,
  clearAnalyticsData,
} = analyticsSlice.actions;

// Selectors
export const selectActiveInsights = (state: { analytics: AnalyticsState }) =>
  state.analytics.insights.filter(i => !i.dismissed);

export const selectInsightsByType = (state: { analytics: AnalyticsState }, type: string) =>
  state.analytics.insights.filter(i => i.type === type && !i.dismissed);

export const selectSpendingPatterns = (state: { analytics: AnalyticsState }) =>
  state.analytics.spendingPatterns;

export const selectPredictions = (state: { analytics: AnalyticsState }) =>
  state.analytics.predictions;

export const selectRecentReports = (state: { analytics: AnalyticsState }, period: 'weekly' | 'monthly' | 'yearly') =>
  state.analytics.reports[period] || [];

export const selectLatestReport = (state: { analytics: AnalyticsState }, period: 'weekly' | 'monthly' | 'yearly') =>
  state.analytics.reports[period]?.[0] || null;

export default analyticsSlice.reducer;

