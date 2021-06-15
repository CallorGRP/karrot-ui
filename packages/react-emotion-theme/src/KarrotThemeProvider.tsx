import * as React from 'react';
import useDarkMode from 'use-dark-mode';
import { css, Global, ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import type { ColorScheme, SemanticColorScheme } from '@karrotmarket/design-token';
import { colors, populateSemanticColors } from '@karrotmarket/design-token';
import { ThemeStorageContext, DarkModeContext } from '@karrotmarket/react-theming';

export type KarrotTheme = {
  colors: ColorScheme & SemanticColorScheme,
};

declare module '@emotion/react' {
  export interface Theme extends KarrotTheme {}
}

type ThemeName = (
  | 'light'
  | 'dark'
);

type ThemeClassName = `${ThemeName}-theme`;

type BehaviorMode = (
  | 'auto'
  | 'light-only'
  | 'dark-only'
);

const classNameLight: ThemeClassName = 'light-theme';
const classNameDark: ThemeClassName = 'dark-theme';

type KarrotThemeProviderProps = {
  children: React.ReactNode,

  /**
   * Behavior mode
   *
   * @default 'auto'
   */
  mode?: BehaviorMode,
};

const getThemeName = (mode: BehaviorMode, isDarkMode: boolean): ThemeName => {
  switch (mode) {
    case 'auto': return isDarkMode ? 'dark' : 'light';
    case 'light-only': return 'light';
    case 'dark-only': return 'dark';
  }
}

export const KarrotThemeProvider: React.FC<KarrotThemeProviderProps> = ({
  children,
  mode = 'auto',
}) => {
  const storage = React.useContext(ThemeStorageContext);

  /**
   * initial = switch mode {
   * | 'auto'       => 'light' // dark?: false
   * | 'light-only' => 'light' // dark?: false
   * | 'dark-only'  => 'dark'  // dark?: true
   * }
   */
  const usingDarkAsInitial = mode === 'dark-only';

  const darkMode = useDarkMode(usingDarkAsInitial, {
    storageProvider: storage,
    classNameDark,
    classNameLight,
    onChange: (isDarkMode = false) => {
      const [nextClassName, prevClassName] = getThemeName(mode, isDarkMode) === 'dark' 
        ? [classNameDark, classNameLight]
        : [classNameLight, classNameDark]

      const body = document.body;

      body.classList.add(nextClassName);
      body.classList.remove(prevClassName)
    }
  });

  const theme = React.useMemo(() => {
    const isDarkMode = darkMode.value;
    // 아 패턴매칭 마렵네 진짜
    const colorTheme = colors[getThemeName(mode, isDarkMode)];

    return {
      colors: {
        ...colorTheme.scheme,
        ...populateSemanticColors(
          colorTheme.scheme,
          colorTheme.semanticScheme,
        ),
      },
    };
  }, [mode, darkMode.value]);

  const availableScheme: Record<BehaviorMode, string> = {
    'auto'      : 'light dark',
    'light-only': 'light',
    'dark-only' : 'dark',
  };

  return (
    <>
      {/* required for iOS */}
      <Global
        styles={css`
          :root {
            color-scheme: ${availableScheme[mode]};
          }
        `}
      />
      <DarkModeContext.Provider value={darkMode}>
        <EmotionThemeProvider theme={theme}>
          {children}
        </EmotionThemeProvider>
      </DarkModeContext.Provider>
    </>
  );
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  KarrotThemeProvider.displayName = 'KarrotThemeProvider(Emotion)';
}
