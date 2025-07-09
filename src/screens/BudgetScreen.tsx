import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../store';
import { 
  selectAllBudgets, 
  selectTotalBudget, 
  selectTotalSpent,
  selectOverBudgetCategories,
  deleteBudget,
  Budget
} from '../store/slices/budgetsSlice';
import { RootStackParamList } from '../navigation/AppNavigator';

type BudgetNavigationProp = StackNavigationProp<RootStackParamList>;

const BudgetScreen = () => {
  const navigation = useNavigation<BudgetNavigationProp>();
  const dispatch = useDispatch();
  
  const budgets = useSelector((state: RootState) => selectAllBudgets(state));
  const totalBudget = useSelector((state: RootState) => selectTotalBudget(state));
  const totalSpent = useSelector((state: RootState) => selectTotalSpent(state));
  const overBudgetCategories = useSelector((state: RootState) => selectOverBudgetCategories(state));

  const remainingBudget = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
    if (percentage >= 100) return { status: 'over', color: '#EF4444' };
    if (percentage >= budget.alertThreshold) return { status: 'warning', color: '#F59E0B' };
    return { status: 'good', color: '#10B981' };
  };

  const getBudgetIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Food': 'restaurant',
      'Transport': 'directions-car',
      'Shopping': 'shopping-bag',
      'Bills': 'receipt',
      'Entertainment': 'movie',
      'Healthcare': 'local-hospital',
      'Education': 'school',
      'Others': 'category',
    };
    return icons[category] || 'category';
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteBudget(budgetId))
        },
      ]
    );
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const { status, color } = getBudgetStatus(item);
    const percentage = Math.min((item.spentAmount / item.budgetAmount) * 100, 100);
    const remaining = item.budgetAmount - item.spentAmount;

    return (
      <View style={styles.budgetItem}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetLeft}>
            <View style={[styles.budgetIcon, { backgroundColor: color + '20' }]}>
              <Icon name={getBudgetIcon(item.category)} size={24} color={color} />
            </View>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetCategory}>{item.category}</Text>
              <Text style={styles.budgetPeriod}>{item.period} budget</Text>
            </View>
          </View>
          <View style={styles.budgetActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteBudget(item.id)}
            >
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.budgetProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.spentAmount}>
              {formatCurrency(item.spentAmount)} spent
            </Text>
            <Text style={styles.budgetAmount}>
              of {formatCurrency(item.budgetAmount)}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${percentage}%`, backgroundColor: color }
              ]} 
            />
          </View>
          
          <View style={styles.progressFooter}>
            <Text style={[styles.remainingAmount, { color }]}>
              {remaining >= 0 ? formatCurrency(remaining) + ' remaining' : formatCurrency(Math.abs(remaining)) + ' over budget'}
            </Text>
            <Text style={styles.percentage}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        {status === 'over' && (
          <View style={styles.alertBanner}>
            <Icon name="warning" size={16} color="#EF4444" />
            <Text style={styles.alertText}>Over budget!</Text>
          </View>
        )}

        {status === 'warning' && (
          <View style={[styles.alertBanner, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="warning" size={16} color="#F59E0B" />
            <Text style={[styles.alertText, { color: '#F59E0B' }]}>
              Approaching limit ({item.alertThreshold}%)
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        <Text style={styles.subtitle}>Track your spending against your budgets</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="account-balance-wallet" size={24} color="#3B82F6" />
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalBudget)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Icon name="trending-down" size={24} color="#EF4444" />
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Icon name="savings" size={24} color="#10B981" />
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={[
            styles.summaryAmount, 
            { color: remainingBudget >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {formatCurrency(remainingBudget)}
          </Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <Text style={styles.sectionTitle}>Overall Budget Utilization</Text>
        <View style={styles.utilizationContainer}>
          <View style={styles.utilizationBar}>
            <View 
              style={[
                styles.utilizationFill, 
                { 
                  width: `${Math.min(budgetUtilization, 100)}%`,
                  backgroundColor: budgetUtilization > 100 ? '#EF4444' : 
                                  budgetUtilization > 80 ? '#F59E0B' : '#10B981'
                }
              ]} 
            />
          </View>
          <Text style={styles.utilizationText}>
            {budgetUtilization.toFixed(1)}% of total budget used
          </Text>
        </View>
      </View>

      {/* Add Budget Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBudget')}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Budget</Text>
      </TouchableOpacity>

      {/* Alerts Section */}
      {overBudgetCategories.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Budget Alerts</Text>
          <Text style={styles.sectionSubtitle}>
            {overBudgetCategories.length} categories are over budget
          </Text>
          {overBudgetCategories.map((budget) => (
            <View key={budget.id} style={styles.alertItem}>
              <Icon name="warning" size={20} color="#EF4444" />
              <Text style={styles.alertItemText}>
                {budget.category} is {formatCurrency(budget.spentAmount - budget.budgetAmount)} over budget
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Budget List */}
      <View style={styles.budgetSection}>
        <Text style={styles.sectionTitle}>Budget Categories</Text>
        <Text style={styles.sectionSubtitle}>
          Manage your spending limits by category
        </Text>

        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="account-balance-wallet" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No budgets set</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first budget to start tracking your spending
            </Text>
          </View>
        ) : (
          <FlatList
            data={budgets}
            keyExtractor={(item) => item.id}
            renderItem={renderBudgetItem}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  overallProgress: {
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
  utilizationContainer: {
    marginTop: 8,
  },
  utilizationBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 6,
  },
  utilizationText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  alertsSection: {
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
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertItemText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  budgetSection: {
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
  budgetItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  budgetPeriod: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  budgetProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 6,
  },
  alertText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default BudgetScreen;

