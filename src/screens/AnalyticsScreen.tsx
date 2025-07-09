import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';

import { RootState } from '../store';
import { selectAllTransactions } from '../store/slices/transactionsSlice';
import { selectAllBudgets } from '../store/slices/budgetsSlice';
import { selectActiveInsights, selectSpendingPatterns } from '../store/slices/analyticsSlice';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6 Months');
  const [selectedChart, setSelectedChart] = useState('spending');

  const transactions = useSelector((state: RootState) => selectAllTransactions(state));
  const budgets = useSelector((state: RootState) => selectAllBudgets(state));
  const insights = useSelector((state: RootState) => selectActiveInsights(state));
  const spendingPatterns = useSelector((state: RootState) => selectSpendingPatterns(state));

  const periods = ['1 Month', '3 Months', '6 Months', '1 Year'];
  const chartTypes = [
    { key: 'spending', label: 'Spending Trends', icon: 'trending-down' },
    { key: 'income', label: 'Income Trends', icon: 'trending-up' },
    { key: 'categories', label: 'Categories', icon: 'pie-chart' },
    { key: 'comparison', label: 'Budget vs Actual', icon: 'bar-chart' },
  ];

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const avgMonthlySavings = (totalIncome - totalExpenses) / 6; // Assuming 6 months
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Chart configurations
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  // Sample data for charts
  const spendingTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [2800, 3200, 2900, 3500, 3100, 2850],
      strokeWidth: 3,
    }],
  };

  const incomeTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [4200, 4500, 4300, 4800, 4600, 4400],
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    }],
  };

  const categoryData = [
    { name: 'Food', amount: 850, color: '#FF6B6B', legendFontColor: '#7F7F7F' },
    { name: 'Bills', amount: 1200, color: '#4ECDC4', legendFontColor: '#7F7F7F' },
    { name: 'Shopping', amount: 680, color: '#45B7D1', legendFontColor: '#7F7F7F' },
    { name: 'Transport', amount: 420, color: '#FFA07A', legendFontColor: '#7F7F7F' },
    { name: 'Others', amount: 320, color: '#98D8C8', legendFontColor: '#7F7F7F' },
  ];

  const budgetComparisonData = {
    labels: ['Food', 'Bills', 'Shopping', 'Transport'],
    datasets: [
      {
        data: [800, 1200, 500, 300], // Budget amounts
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      },
      {
        data: [850, 1150, 680, 420], // Actual amounts
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      },
    ],
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'spending':
        return (
          <LineChart
            data={spendingTrendData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'income':
        return (
          <LineChart
            data={incomeTrendData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        );
      case 'categories':
        return (
          <PieChart
            data={categoryData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      case 'comparison':
        return (
          <BarChart
            data={budgetComparisonData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        );
      default:
        return null;
    }
  };

  const renderInsightItem = ({ item }: { item: any }) => {
    const getInsightIcon = (type: string) => {
      switch (type) {
        case 'warning': return 'warning';
        case 'success': return 'check-circle';
        case 'info': return 'info';
        case 'error': return 'error';
        default: return 'info';
      }
    };

    const getInsightColor = (type: string) => {
      switch (type) {
        case 'warning': return '#F59E0B';
        case 'success': return '#10B981';
        case 'info': return '#3B82F6';
        case 'error': return '#EF4444';
        default: return '#6B7280';
      }
    };

    return (
      <View style={styles.insightItem}>
        <View style={[
          styles.insightIcon,
          { backgroundColor: getInsightColor(item.type) + '20' }
        ]}>
          <Icon 
            name={getInsightIcon(item.type)} 
            size={20} 
            color={getInsightColor(item.type)} 
          />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{item.title}</Text>
          <Text style={styles.insightDescription}>{item.description}</Text>
          {item.action && (
            <Text style={styles.insightAction}>{item.action}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Insights into your financial patterns and trends</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={periods}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.periodChip,
                selectedPeriod === item && styles.periodChipSelected
              ]}
              onPress={() => setSelectedPeriod(item)}
            >
              <Text style={[
                styles.periodChipText,
                selectedPeriod === item && styles.periodChipTextSelected
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.periodList}
        />
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Icon name="trending-up" size={20} color="#10B981" />
          <Text style={styles.metricLabel}>Total Income</Text>
          <Text style={styles.metricValue}>{formatCurrency(totalIncome)}</Text>
          <Text style={styles.metricPeriod}>Last 7 months</Text>
        </View>

        <View style={styles.metricCard}>
          <Icon name="trending-down" size={20} color="#EF4444" />
          <Text style={styles.metricLabel}>Total Expenses</Text>
          <Text style={styles.metricValue}>{formatCurrency(totalExpenses)}</Text>
          <Text style={styles.metricPeriod}>Last 7 months</Text>
        </View>

        <View style={styles.metricCard}>
          <Icon name="attach-money" size={20} color="#3B82F6" />
          <Text style={styles.metricLabel}>Avg. Monthly Savings</Text>
          <Text style={styles.metricValue}>{formatCurrency(avgMonthlySavings)}</Text>
          <Text style={styles.metricPeriod}>Per month average</Text>
        </View>

        <View style={styles.metricCard}>
          <Icon name="donut-large" size={20} color="#8B5CF6" />
          <Text style={styles.metricLabel}>Savings Rate</Text>
          <Text style={styles.metricValue}>{savingsRate.toFixed(1)}%</Text>
          <Text style={styles.metricPeriod}>Of total income</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Financial Trends</Text>
        
        {/* Chart Type Selector */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={chartTypes}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chartTypeChip,
                selectedChart === item.key && styles.chartTypeChipSelected
              ]}
              onPress={() => setSelectedChart(item.key)}
            >
              <Icon 
                name={item.icon} 
                size={16} 
                color={selectedChart === item.key ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[
                styles.chartTypeText,
                selectedChart === item.key && styles.chartTypeTextSelected
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chartTypeList}
        />

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>
            {chartTypes.find(c => c.key === selectedChart)?.label || 'Chart'}
          </Text>
          <Text style={styles.chartSubtitle}>
            {selectedChart === 'spending' && 'Monthly comparison over time'}
            {selectedChart === 'income' && 'Monthly income trends'}
            {selectedChart === 'categories' && 'Breakdown of your monthly expenses'}
            {selectedChart === 'comparison' && 'Budget vs actual spending by category'}
          </Text>
          {renderChart()}
        </View>
      </View>

      {/* Financial Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Financial Insights</Text>
        <Text style={styles.sectionSubtitle}>
          AI-powered insights to help you manage your finances better
        </Text>

        {insights.length === 0 ? (
          <View style={styles.emptyInsights}>
            <Icon name="lightbulb-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyInsightsText}>No insights available</Text>
            <Text style={styles.emptyInsightsSubtext}>
              Add more transactions to get personalized insights
            </Text>
          </View>
        ) : (
          <FlatList
            data={insights}
            keyExtractor={(item) => item.id}
            renderItem={renderInsightItem}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>Quick Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {transactions.filter(t => t.type === 'expense').length}
            </Text>
            <Text style={styles.statLabel}>Total Transactions</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Set(transactions.map(t => t.category)).size}
            </Text>
            <Text style={styles.statLabel}>Categories Used</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {budgets.length}
            </Text>
            <Text style={styles.statLabel}>Active Budgets</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(totalExpenses / transactions.filter(t => t.type === 'expense').length || 0)}
            </Text>
            <Text style={styles.statLabel}>Avg. Transaction</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  periodContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodList: {
    paddingRight: 20,
  },
  periodChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  periodChipSelected: {
    backgroundColor: '#F59E0B',
  },
  periodChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  periodChipTextSelected: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  metricPeriod: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  chartTypeList: {
    paddingBottom: 16,
  },
  chartTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  chartTypeChipSelected: {
    backgroundColor: '#3B82F6',
  },
  chartTypeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  chartTypeTextSelected: {
    color: '#FFFFFF',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  insightsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyInsights: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyInsightsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyInsightsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  insightAction: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  quickStatsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AnalyticsScreen;

