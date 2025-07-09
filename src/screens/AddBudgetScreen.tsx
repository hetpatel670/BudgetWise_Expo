import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { addBudget } from '../store/slices/budgetsSlice';

const AddBudgetScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [category, setCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const categories = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 
    'Healthcare', 'Education', 'Others'
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const categoryIcons: { [key: string]: string } = {
    'Food': 'restaurant',
    'Transport': 'directions-car',
    'Shopping': 'shopping-bag',
    'Bills': 'receipt',
    'Entertainment': 'movie',
    'Healthcare': 'local-hospital',
    'Education': 'school',
    'Others': 'category',
  };

  const calculateDates = (selectedPeriod: string) => {
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    let endDate: string;

    if (selectedPeriod === 'weekly') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      endDate = nextWeek.toISOString().split('T')[0];
    } else if (selectedPeriod === 'monthly') {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate = nextMonth.toISOString().split('T')[0];
    } else {
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      endDate = nextYear.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  const handleSave = () => {
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!budgetAmount.trim() || isNaN(Number(budgetAmount)) || Number(budgetAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    const threshold = Number(alertThreshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      Alert.alert('Error', 'Alert threshold must be between 0 and 100');
      return;
    }

    const { startDate, endDate } = calculateDates(period);

    dispatch(addBudget({
      category,
      budgetAmount: Number(budgetAmount),
      period,
      startDate,
      endDate,
      alertThreshold: threshold,
    }));

    Alert.alert(
      'Success',
      'Budget created successfully!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setCategory(item);
        setShowCategoryModal(false);
      }}
    >
      <Icon name={categoryIcons[item] || 'category'} size={24} color="#3B82F6" />
      <Text style={styles.modalItemText}>{item}</Text>
      {category === item && (
        <Icon name="check" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  const renderPeriodItem = ({ item }: { item: { value: string; label: string } }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setPeriod(item.value as 'monthly' | 'weekly' | 'yearly');
        setShowPeriodModal(false);
      }}
    >
      <Icon name="schedule" size={24} color="#3B82F6" />
      <Text style={styles.modalItemText}>{item.label}</Text>
      {period === item.value && (
        <Icon name="check" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Budget</Text>
        <Text style={styles.subtitle}>Set spending limits for different categories</Text>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.selectorLeft}>
              {category && (
                <Icon 
                  name={categoryIcons[category] || 'category'} 
                  size={20} 
                  color="#3B82F6" 
                />
              )}
              <Text style={[
                styles.selectorText,
                !category && styles.placeholderText
              ]}>
                {category || 'Select category'}
              </Text>
            </View>
            <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Budget Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Period Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget Period</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowPeriodModal(true)}
          >
            <View style={styles.selectorLeft}>
              <Icon name="schedule" size={20} color="#3B82F6" />
              <Text style={styles.selectorText}>
                {periods.find(p => p.value === period)?.label || 'Monthly'}
              </Text>
            </View>
            <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Alert Threshold */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Alert Threshold</Text>
          <Text style={styles.helperText}>
            Get notified when you reach this percentage of your budget
          </Text>
          <View style={styles.thresholdContainer}>
            <TextInput
              style={styles.thresholdInput}
              value={alertThreshold}
              onChangeText={setAlertThreshold}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>

        {/* Budget Preview */}
        {category && budgetAmount && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Budget Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Icon 
                  name={categoryIcons[category] || 'category'} 
                  size={24} 
                  color="#3B82F6" 
                />
                <Text style={styles.previewCategory}>{category}</Text>
              </View>
              <Text style={styles.previewAmount}>
                ${Number(budgetAmount).toLocaleString()} / {period}
              </Text>
              <Text style={styles.previewAlert}>
                Alert at {alertThreshold}% (${(Number(budgetAmount) * Number(alertThreshold) / 100).toFixed(2)})
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Icon name="check" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Create Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Period</Text>
              <TouchableOpacity
                onPress={() => setShowPeriodModal(false)}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={periods}
              keyExtractor={(item) => item.value}
              renderItem={renderPeriodItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  amountContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  thresholdContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 120,
  },
  thresholdInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  percentSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  previewContainer: {
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  previewAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  previewAlert: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
});

export default AddBudgetScreen;

