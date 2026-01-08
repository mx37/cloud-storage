// User Settings Management
// Stores S3/R2 storage configuration

const SETTINGS_KEY = "app_settings";
const STORAGE_CONFIG_KEY = "storage_config";

export interface AppSettings {}

export interface StorageConfig {
  provider: 's3' | 'r2' | 'custom';
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  accountId?: string; // For Cloudflare R2
}

const DEFAULT_SETTINGS: AppSettings = {
};

// Get current settings from localStorage
export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = getSettings();
    const updated = {
      ...current,
      ...settings,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

// Reset settings to default
export function resetSettings(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(SETTINGS_KEY);
}

// Get storage configuration from localStorage
export function getStorageConfig(): StorageConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load storage config:", error);
  }

  return null;
}

// Save storage configuration to localStorage
export function saveStorageConfig(config: StorageConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save storage config:", error);
  }
}

// Clear storage configuration
export function clearStorageConfig(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_CONFIG_KEY);
}

// Check if storage is configured
export function isStorageConfigured(): boolean {
  const config = getStorageConfig();
  return !!(
    config &&
    config.endpoint &&
    config.bucket &&
    config.accessKeyId &&
    config.secretAccessKey
  );
}
