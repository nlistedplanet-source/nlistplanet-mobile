import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

// Dark theme temporarily disabled - will be fixed and implemented later
export const ThemeProvider = ({ children }) => {
  // Always use light theme for now
  const theme = 'light';

  // Toggle function disabled
  const toggle = () => {
    console.log('Dark theme is temporarily disabled');
  };

  const setTheme = () => {
    console.log('Dark theme is temporarily disabled');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;