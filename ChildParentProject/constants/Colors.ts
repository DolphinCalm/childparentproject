/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4a6fa5';
const tintColorDark = '#6b8cae';

export const Colors = {
  light: {
    text: '#2C3E50',
    background: '#f8f9fa',
    tint: tintColorLight,
    icon: '#9e9e9e',
    tabIconDefault: '#9e9e9e',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E8E8E8',
    background: '#1a1a1a',
    tint: tintColorDark,
    icon: '#b0b0b0',
    tabIconDefault: '#b0b0b0',
    tabIconSelected: tintColorDark,
  },
};
