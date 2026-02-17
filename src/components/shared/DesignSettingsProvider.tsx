import { useDesignSettings } from '@/hooks/useDesignSettings';

/**
 * Invisible component that loads design settings and applies them to DOM.
 * Place inside QueryClientProvider in App.tsx.
 */
const DesignSettingsProvider = () => {
  useDesignSettings();
  return null;
};

export default DesignSettingsProvider;
