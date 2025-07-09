import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, PieChart } from 'react-native-chart-kit';

import { RootState } from '../store';
import { selectAllTransactions, selectRecentTransactions } from '../store/slices/transactionsSlice';
import { selectAllBudgets, selectTotalBudget, selectTotalSpent } from '../store/slices/budgetsSlice';
import { RootStackParamList } from '../navigation/AppNavigator';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const transactions = useSelector((state: RootState) => selectAllTransactions(state));
  const recentTransactions = useSelector((state: RootState) => selectRecentTransactions(state, 5));
  const budgets = useSelector((state: RootState) => selectAllBudgets(state));
  const totalBudget = useSelector((state: RootState) => selectTotalBudget(state));
  const totalSpent = useSelector((state: RootState) => selectTotalSpent(state));

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const totalBalance = totalIncome - totalExpenses;
  const savingsGoal = 10000;
  const currentSavings = 7250;
  const savingsProgress = (currentSavings / savingsGoal) * 100;

  // Weekly spending data for chart
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [120, 85, 200, 150, 280, 180, 90],
      strokeWidth: 2,
    }],
  };

  // Category spending data for pie chart
  const categoryData = [
    { name: 'Food', amount: 850, color: '#FF6B6B', legendFontColor: '#7F7F7F' },
    { name: 'Bills', amount: 1200, color: '#4ECDC4', legendFontColor: '#7F7F7F' },
    { name: 'Shopping', amount: 680, color: '#45B7D1', legendFontColor: '#7F7F7F' },
    { name: 'Transport', amount: 420, color: '#FFA07A', legendFontColor: '#7F7F7F' },
    { name: 'Others', amount: 320, color: '#98D8C8', legendFontColor: '#7F7F7F' },
  ];

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? 'trending-up' : 'trending-down';
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? '#10B981' : '#EF4444';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitleText}>Here's your financial overview</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Financial Overview Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <View style={[styles.card, styles.balanceCard]}>
            <View style={styles.cardHeader}>
              <Icon name="account-balance-wallet" size={24} color="#3B82F6" />
              <Text style={styles.cardTitle}>Total Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
            <Text style={styles.changeText}>+2.5% from last month</Text>
          </View>

          <View style={[styles.card, styles.incomeCard]}>
            <View style={styles.cardHeader}>
              <Icon name="trending-up" size={24} color="#10B981" />
              <Text style={styles.cardTitle}>Monthly Income</Text>
            </View>
            <Text style={styles.incomeAmount}>{formatCurrency(totalIncome)}</Text>
            <Text style={styles.changeText}>+5.2% from last month</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.expenseCard]}>
            <View style={styles.cardHeader}>
              <Icon name="trending-down" size={24} color="#EF4444" />
              <Text style={styles.cardTitle}>Monthly Expenses</Text>
            </View>
            <Text style={styles.expenseAmount}>{formatCurrency(totalExpenses)}</Text>
            <Text style={styles.changeText}>-1.8% from last month</Text>
          </View>

          <View style={[styles.card, styles.savingsCard]}>
            <View style={styles.cardHeader}>
              <Icon name="savings" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Savings Goal</Text>
            </View>
            <Text style={styles.savingsPercentage}>{savingsProgress.toFixed(1)}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${savingsProgress}%` }]} />
            </View>
            <Text style={styles.savingsText}>
              {formatCurrency(currentSavings)} of {formatCurrency(savingsGoal)}
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Spending Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Weekly Spending</Text>
        <Text style={styles.sectionSubtitle}>Your spending pattern for this week</Text>
        <LineChart
          data={weeklyData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Expense Categories */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Expense Categories</Text>
        <Text style={styles.sectionSubtitle}>Breakdown of your monthly expenses</Text>
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
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Your latest financial activities</Text>

        {recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: getTransactionColor(transaction.type) + '20' }
              ]}>
                <Icon 
                  name={getTransactionIcon(transaction.type)} 
                  size={20} 
                  color={getTransactionColor(transaction.type)} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: getTransactionColor(transaction.type) }
            ]}>
              {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        ))}
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
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  cardsContainer: {
    padding: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  balanceCard: {},
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  incomeCard: {},
  incomeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  expenseCard: {},
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  savingsCard: {},
  savingsPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  changeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  chart: {
    borderRadius: 16,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;

