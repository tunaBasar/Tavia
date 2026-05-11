/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2E5F3E'; // Cafe Green
const tintColorDark = '#6B9E78';  // Matcha Light Green

export const Colors = {
  light: {
    text: '#4E342E', // Earthy Brown
    background: '#FAFAFA', // Clean White
    tint: tintColorLight, // Green
    icon: '#795548', // Medium Brown
    tabIconDefault: '#795548',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#EFEBE9', // Light Warm White
    background: '#3E2723', // Dark Roast Brown
    tint: tintColorDark, // Light Green
    icon: '#BCAAA4', // Soft Taupe/Brown
    tabIconDefault: '#BCAAA4',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
