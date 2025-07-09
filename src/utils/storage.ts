import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'budgetwise_';

// Simple encryption simulation for demo purposes
// In production, use proper encryption libraries like react-native-keychain
const simpleEncrypt = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple base64 encoding as encryption simulation
    return Buffer.from(jsonString).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

const simpleDecrypt = (encryptedData: string): any => {
  try {
    // Simple base64 decoding as decryption simulation
    const jsonString = Buffer.from(encryptedData, 'base64').toString();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export const saveToStorage = async (key: string, data: any): Promise<boolean> => {
  try {
    const encryptedData = simpleEncrypt(data);
    if (encryptedData) {
      await AsyncStorage.setItem(STORAGE_PREFIX + key, encryptedData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Storage save error:', error);
    return false;
  }
};

export const loadFromStorage = async (key: string): Promise<any> => {
  try {
    const encryptedData = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    if (encryptedData) {
      return simpleDecrypt(encryptedData);
    }
    return null;
  } catch (error) {
    console.error('Storage load error:', error);
    return null;
  }
};

// Synchronous versions for initial state (fallback to empty data)
export const saveToStorageSync = (key: string, data: any): void => {
  saveToStorage(key, data).catch(console.error);
};

export const loadFromStorageSync = (key: string): any => {
  // For initial state, return null and let async loading handle it
  return null;
};

// For compatibility with existing code
export { saveToStorageSync as saveToStorage, loadFromStorageSync as loadFromStorage };

export const removeFromStorage = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error('Storage remove error:', error);
    return false;
  }
};

export const clearAllStorage = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const budgetWiseKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(budgetWiseKeys);
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
};

// Backup and restore functionality
export const createBackup = async (): Promise<string | null> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const budgetWiseKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
    const keyValuePairs = await AsyncStorage.multiGet(budgetWiseKeys);
    
    const backupData: { [key: string]: any } = {};
    keyValuePairs.forEach(([key, value]) => {
      if (value) {
        const cleanKey = key.replace(STORAGE_PREFIX, '');
        backupData[cleanKey] = simpleDecrypt(value);
      }
    });

    backupData.backupDate = new Date().toISOString();
    backupData.version = '1.0.0';

    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    console.error('Backup creation error:', error);
    return null;
  }
};

export const restoreFromBackup = async (backupString: string): Promise<boolean> => {
  try {
    const backupData = JSON.parse(backupString);
    
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup data');
    }

    // Validate backup structure
    const requiredFields = ['transactions', 'budgets', 'profile'];
    const hasRequiredFields = requiredFields.some(field => backupData[field]);
    
    if (!hasRequiredFields) {
      throw new Error('Backup data is missing required fields');
    }

    // Restore data
    const promises = Object.keys(backupData).map(key => {
      if (key !== 'backupDate' && key !== 'version' && backupData[key]) {
        return saveToStorage(key, backupData[key]);
      }
      return Promise.resolve(true);
    });

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Backup restore error:', error);
    return false;
  }
};

// Data integrity verification
export const verifyDataIntegrity = async (): Promise<{ isValid: boolean; issues: string[] }> => {
  try {
    const transactions = await loadFromStorage('transactions');
    const budgets = await loadFromStorage('budgets');
    const profile = await loadFromStorage('profile');

    const issues: string[] = [];

    // Check transactions
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach((transaction: any, index: number) => {
        if (!transaction.id || !transaction.description || typeof transaction.amount !== 'number') {
          issues.push(`Transaction ${index}: Missing required fields`);
        }
      });
    }

    // Check budgets
    if (budgets && Array.isArray(budgets)) {
      budgets.forEach((budget: any, index: number) => {
        if (!budget.id || !budget.category || typeof budget.budgetAmount !== 'number') {
          issues.push(`Budget ${index}: Missing required fields`);
        }
      });
    }

    // Check profile
    if (profile && typeof profile === 'object') {
      if (!profile.name || !profile.email || !profile.currency) {
        issues.push('Profile: Missing required fields');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  } catch (error) {
    console.error('Data integrity check error:', error);
    return {
      isValid: false,
      issues: ['Data integrity check failed'],
    };
  }
};

