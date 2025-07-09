import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../store';
import { 
  selectAllTransactions, 
  deleteTransaction,
  Transaction 
} from '../store/slices/transactionsSlice';
import { RootStackParamList } from '../navigation/AppNavigator';

type TransactionsNavigationProp = StackNavigationProp<RootStackParamList>;

const TransactionsScreen = () => {
  const navigation = useNavigation<TransactionsNavigationProp>();
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) => selectAllTransactions(state));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const netAmount = totalIncome - totalExpenses;

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
    const matchesType = selectedType === 'All' || transaction.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ['All', ...Array.from(new Set(transactions.map(t => t.category)))];
  const types = ['All', 'income', 'expense'];

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

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteTransaction(transactionId))
        },
      ]
    );
  };

  const handleEditTransaction = (transactionId: string) => {
    navigation.navigate('EditTransaction', { transactionId });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: getTransactionColor(item.type) + '20' }
        ]}>
          <Icon 
            name={getTransactionIcon(item.type)} 
            size={20} 
            color={getTransactionColor(item.type)} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
          {item.notes && (
            <Text style={styles.transactionNotes}>{item.notes}</Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: getTransactionColor(item.type) }
        ]}>
          {item.type === 'income' ? '+' : ''}{formatCurrency(item.amount)}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditTransaction(item.id)}
          >
            <Icon name="edit" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteTransaction(item.id)}
          >
            <Icon name="delete" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterChip = (
    items: string[], 
    selectedItem: string, 
    onSelect: (item: string) => void
  ) => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedItem === item && styles.filterChipSelected
          ]}
          onPress={() => onSelect(item)}
        >
          <Text style={[
            styles.filterChipText,
            selectedItem === item && styles.filterChipTextSelected
          ]}>
            {item}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.filterContainer}
    />
  );

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="trending-up" size={20} color="#10B981" />
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryIncome}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="trending-down" size={20} color="#EF4444" />
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryExpense}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="account-balance" size={20} color="#3B82F6" />
          <Text style={styles.summaryLabel}>Net Amount</Text>
          <Text style={[
            styles.summaryNet,
            { color: netAmount >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {formatCurrency(netAmount)}
          </Text>
        </View>
      </View>

      {/* Add Transaction Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterTitle}>Filter Transactions</Text>
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.filterLabel}>Categories</Text>
        {renderFilterChip(categories, selectedCategory, setSelectedCategory)}

        <Text style={styles.filterLabel}>Types</Text>
        {renderFilterChip(types, selectedType, setSelectedType)}
      </View>

      {/* Transaction List */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>
          Transaction History
        </Text>
        <Text style={styles.sectionSubtitle}>
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </Text>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="receipt" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No transactions found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
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
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryIncome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  summaryExpense: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  summaryNet: {
    fontSize: 16,
    fontWeight: 'bold',
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
  filtersSection: {
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
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  transactionsSection: {
    flex: 1,
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
  transactionsList: {
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
  transactionNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
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

export default TransactionsScreen;

