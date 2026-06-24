// ThemeContext removed — theme switcher reverted per team decision.
// File kept as placeholder to avoid broken imports if referenced anywhere.
// Safe to delete entirely once confirmed no component imports from here.
export const ThemeProvider = ({ children }) => children
export const useTheme = () => ({ theme: 'dark', toggle: () => {} })
