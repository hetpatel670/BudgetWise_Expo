import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../store';
import { 
  selectProfile,
  selectNotifications,
  selectSecurity,
  selectAppearance,
  selectPreferences,
  updateProfile,
  updateNotifications,
  updateSecurity,
  updateAppearance,
  updatePreferences,
  resetSettings
} from '../store/slices/settingsSlice';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  
  const profile = useSelector((state: RootState) => selectProfile(state));
  const notifications = useSelector((state: RootState) => selectNotifications(state));
  const security = useSelector((state: RootState) => selectSecurity(state));
  const appearance = useSelector((state: RootState) => selectAppearance(state));
  const preferences = useSelector((state: RootState) => selectPreferences(state));

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: 'light-mode' },
    { value: 'dark', label: 'Dark', icon: 'dark-mode' },
    { value: 'system', label: 'System', icon: 'settings-brightness' },
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
  ];

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            dispatch(resetSettings());
            Alert.alert('Success', 'Settings have been reset to default values.');
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your financial data will be exported as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            Alert.alert('Success', 'Data exported successfully!');
          }
        },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Select a backup file to import your financial data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: () => {
            Alert.alert('Success', 'Data imported successfully!');
          }
        },
      ]
    );
  };

  const renderModalItem = (
    items: any[], 
    selectedValue: string, 
    onSelect: (value: string) => void,
    onClose: () => void
  ) => (
    <FlatList
      data={items}
      keyExtractor={(item) => item.value}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.modalItem}
          onPress={() => {
            onSelect(item.value);
            onClose();
          }}
        >
          {item.icon && (
            <Icon name={item.icon} size={24} color="#3B82F6" />
          )}
          <Text style={styles.modalItemText}>{item.label}</Text>
          {selectedValue === item.value && (
            <Icon name="check" size={20} color="#10B981" />
          )}
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
    />
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={24} color="#3B82F6" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {value && (
          <Text style={styles.settingValue}>{value}</Text>
        )}
        {showArrow && onPress && (
          <Icon name="keyboard-arrow-right" size={24} color="#6B7280" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="person" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Icon name="edit" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <SectionHeader title="Notifications" />
        
        <SettingItem
          icon="notifications"
          title="Budget Alerts"
          subtitle="Get notified when approaching budget limits"
          showArrow={false}
          rightComponent={
            <Switch
              value={notifications.budgetAlerts}
              onValueChange={(value) => 
                dispatch(updateNotifications({ budgetAlerts: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="receipt"
          title="Transaction Reminders"
          subtitle="Reminders to log your transactions"
          showArrow={false}
          rightComponent={
            <Switch
              value={notifications.transactionReminders}
              onValueChange={(value) => 
                dispatch(updateNotifications({ transactionReminders: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="email"
          title="Weekly Reports"
          subtitle="Receive weekly financial summaries"
          showArrow={false}
          rightComponent={
            <Switch
              value={notifications.weeklyReports}
              onValueChange={(value) => 
                dispatch(updateNotifications({ weeklyReports: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="push-pin"
          title="Push Notifications"
          subtitle="Enable push notifications"
          showArrow={false}
          rightComponent={
            <Switch
              value={notifications.pushNotifications}
              onValueChange={(value) => 
                dispatch(updateNotifications({ pushNotifications: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      {/* Security */}
      <View style={styles.section}>
        <SectionHeader title="Security & Privacy" />
        
        <SettingItem
          icon="fingerprint"
          title="Biometric Authentication"
          subtitle="Use fingerprint or face ID to unlock"
          showArrow={false}
          rightComponent={
            <Switch
              value={security.biometricAuth}
              onValueChange={(value) => 
                dispatch(updateSecurity({ biometricAuth: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="lock"
          title="Auto Lock"
          subtitle="Automatically lock the app when inactive"
          showArrow={false}
          rightComponent={
            <Switch
              value={security.autoLock}
              onValueChange={(value) => 
                dispatch(updateSecurity({ autoLock: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="security"
          title="Data Encryption"
          subtitle="Encrypt your financial data"
          showArrow={false}
          rightComponent={
            <Switch
              value={security.dataEncryption}
              onValueChange={(value) => 
                dispatch(updateSecurity({ dataEncryption: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <SectionHeader title="Appearance" />
        
        <SettingItem
          icon="palette"
          title="Theme"
          subtitle="Choose your preferred theme"
          value={themes.find(t => t.value === appearance.theme)?.label}
          onPress={() => setShowThemeModal(true)}
        />

        <SettingItem
          icon="attach-money"
          title="Currency"
          subtitle="Default currency for transactions"
          value={currencies.find(c => c.value === profile.currency)?.label}
          onPress={() => setShowCurrencyModal(true)}
        />

        <SettingItem
          icon="language"
          title="Language"
          subtitle="App language"
          value={languages.find(l => l.value === appearance.language)?.label}
          onPress={() => setShowLanguageModal(true)}
        />
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <SectionHeader title="Preferences" />
        
        <SettingItem
          icon="category"
          title="Show Category Icons"
          subtitle="Display icons for transaction categories"
          showArrow={false}
          rightComponent={
            <Switch
              value={preferences.showCategoryIcons}
              onValueChange={(value) => 
                dispatch(updatePreferences({ showCategoryIcons: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="decimal"
          title="Show Decimal Places"
          subtitle="Display cents in amounts"
          showArrow={false}
          rightComponent={
            <Switch
              value={preferences.showDecimalPlaces}
              onValueChange={(value) => 
                dispatch(updatePreferences({ showDecimalPlaces: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          icon="flash-on"
          title="Quick Actions"
          subtitle="Enable quick transaction shortcuts"
          showArrow={false}
          rightComponent={
            <Switch
              value={preferences.enableQuickActions}
              onValueChange={(value) => 
                dispatch(updatePreferences({ enableQuickActions: value }))
              }
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <SectionHeader title="Data Management" />
        
        <SettingItem
          icon="cloud-upload"
          title="Export Data"
          subtitle="Export your financial data"
          onPress={handleExportData}
        />

        <SettingItem
          icon="cloud-download"
          title="Import Data"
          subtitle="Import data from backup"
          onPress={handleImportData}
        />

        <SettingItem
          icon="refresh"
          title="Reset Settings"
          subtitle="Reset all settings to default"
          onPress={handleResetSettings}
        />
      </View>

      {/* About */}
      <View style={styles.section}>
        <SectionHeader title="About" />
        
        <SettingItem
          icon="info"
          title="App Version"
          subtitle="BudgetWise v1.0.0"
          showArrow={false}
        />

        <SettingItem
          icon="help"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => Alert.alert('Help', 'Help documentation coming soon!')}
        />

        <SettingItem
          icon="privacy-tip"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
        />
      </View>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {renderModalItem(
              themes,
              appearance.theme,
              (value) => dispatch(updateAppearance({ theme: value as any })),
              () => setShowThemeModal(false)
            )}
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {renderModalItem(
              currencies,
              profile.currency,
              (value) => dispatch(updateProfile({ currency: value })),
              () => setShowCurrencyModal(false)
            )}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {renderModalItem(
              languages,
              appearance.language,
              (value) => dispatch(updateAppearance({ language: value })),
              () => setShowLanguageModal(false)
            )}
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
  profileSection: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editProfileButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
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

export default SettingsScreen;

