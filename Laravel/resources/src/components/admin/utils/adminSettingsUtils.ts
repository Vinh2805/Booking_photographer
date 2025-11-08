export const handleThresholdChange = (
  value: string, 
  setAiSettings: (fn: (prev: any) => any) => void
) => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    setAiSettings(prev => ({
      ...prev,
      ratingAlert: { ...prev.ratingAlert, threshold: numValue }
    }));
  }
};

export const handleFeatureToggle = (
  featureId: string, 
  enabled: boolean, 
  setFeatureFlags: (fn: (prev: any[]) => any[]) => void
) => {
  setFeatureFlags(prev => 
    prev.map(feature => 
      feature.id === featureId ? { ...feature, enabled } : feature
    )
  );
};

export const handleNotificationChange = (
  key: string, 
  value: boolean, 
  setNotifications: (fn: (prev: any) => any) => void
) => {
  setNotifications(prev => ({ ...prev, [key]: value }));
};

export const handleSystemSettingChange = (
  key: string, 
  value: boolean, 
  setSystemSettings: (fn: (prev: any) => any) => void
) => {
  setSystemSettings(prev => ({ ...prev, [key]: value }));
};

export const handleAiPrivacyChange = (
  key: string, 
  checked: boolean, 
  setAiSettings: (fn: (prev: any) => any) => void
) => {
  setAiSettings(prev => ({
    ...prev,
    privacyFilter: { ...prev.privacyFilter, [key]: checked }
  }));
};

export const handleAiRatingChange = (
  key: string, 
  checked: boolean, 
  setAiSettings: (fn: (prev: any) => any) => void
) => {
  setAiSettings(prev => ({
    ...prev,
    ratingAlert: { ...prev.ratingAlert, [key]: checked }
  }));
};