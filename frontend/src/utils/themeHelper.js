// Utility to determine theme based on current route
export const getThemeColors = () => {
  const path = window.location.pathname;
  const isEmployee = path.startsWith('/dashboard') && !path.startsWith('/dashboard/manager') && !path.startsWith('/dashboard/super-admin');
  
  if (isEmployee) {
    return {
      // Green theme for employees
      primary: 'green-600',
      primaryHover: 'green-700',
      primaryLight: 'green-50',
      primaryLighter: 'green-100',
      primaryText: 'green-600',
      primaryTextDark: 'green-700',
      primaryBorder: 'green-500',
      primaryBorderLight: 'green-200',
      primaryRing: 'green-300',
      primaryGradient: 'from-green-500 to-emerald-600',
      primaryGradientHover: 'from-green-600 to-emerald-700',
      // CSS classes
      bgPrimary: 'bg-green-600',
      bgPrimaryHover: 'hover:bg-green-700',
      bgPrimaryLight: 'bg-green-50',
      bgPrimaryLighter: 'bg-green-100',
      textPrimary: 'text-green-600',
      textPrimaryHover: 'hover:text-green-700',
      borderPrimary: 'border-green-500',
      borderPrimaryLight: 'border-green-200',
      focusBorderPrimary: 'focus:border-green-500',
      focusRingPrimary: 'focus:ring-green-300',
    };
  }
  
  // Blue theme for managers (default)
  return {
    primary: 'blue-600',
    primaryHover: 'blue-700',
    primaryLight: 'blue-50',
    primaryLighter: 'blue-100',
    primaryText: 'blue-600',
    primaryTextDark: 'blue-700',
    primaryBorder: 'blue-500',
    primaryBorderLight: 'blue-200',
    primaryRing: 'blue-300',
    primaryGradient: 'from-blue-500 to-indigo-600',
    primaryGradientHover: 'from-blue-600 to-indigo-700',
    // CSS classes
    bgPrimary: 'bg-blue-600',
    bgPrimaryHover: 'hover:bg-blue-700',
    bgPrimaryLight: 'bg-blue-50',
    bgPrimaryLighter: 'bg-blue-100',
    textPrimary: 'text-blue-600',
    textPrimaryHover: 'hover:text-blue-700',
    borderPrimary: 'border-blue-500',
    borderPrimaryLight: 'border-blue-200',
    focusBorderPrimary: 'focus:border-blue-500',
    focusRingPrimary: 'focus:ring-blue-300',
  };
};

// Hook version
export const useThemeColors = () => {
  return getThemeColors();
};
