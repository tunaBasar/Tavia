/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#5D4037'; // Mocha Brown
const tintColorDark = '#D7CCC8';  // Latte Light Brown

export const Colors = {
  light: {
    text: '#3E2723', // Dark Roast Brown
    background: '#FAFAFA', // Clean White
    tint: tintColorLight,
    icon: '#795548', // Wood Brown
    tabIconDefault: '#795548',
    tabIconSelected: tintColorLight,
    card: '#F5F5DC', // Beige
    border: '#D7CCC8',
  },
  dark: {
    text: '#EFEBE9', // Light Warm White
    background: '#2D1B15', // Deep Coffee Brown
    tint: tintColorDark,
    icon: '#BCAAA4', // Soft Mocha
    tabIconDefault: '#BCAAA4',
    tabIconSelected: tintColorDark,
    card: '#3E2723', // Dark Roast Card
    border: '#4E342E',
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
