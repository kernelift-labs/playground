import type { App } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset, updatePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import { getPrimaryColor } from '@/assets/style/theme';
import { StyleConfigs } from '@/constants';
import zhCN from '@/utils/primevue/i18n/zh-CN.json';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { watch } from 'vue';
import { useTheme } from '@kernelift/core';

export function addPrimeVue(app: App, locale = 'zh-CN') {
  const { isDark } = useTheme();

  // Get initial primary colors based on theme
  const initialPrimaryColors = getPrimaryColor(
    isDark.value ? StyleConfigs.PRIMARY_COLOR_DARK : StyleConfigs.PRIMARY_COLOR
  );

  const MyPreset = definePreset(Aura, {
    semantic: {
      primary: initialPrimaryColors
    }
  });

  app.use(PrimeVue, {
    locale: locale === 'zh-CN' ? zhCN : undefined,
    theme: {
      preset: MyPreset,
      options: {
        prefix: StyleConfigs.PREFIX,
        darkModeSelector: '.dark',
        cssLayer: false
      }
    }
  });

  // Watch theme changes and update primary colors
  watch(isDark, (newIsDark) => {
    const newPrimaryColors = getPrimaryColor(
      newIsDark ? StyleConfigs.PRIMARY_COLOR_DARK : StyleConfigs.PRIMARY_COLOR
    );

    updatePreset({
      semantic: {
        primary: newPrimaryColors
      }
    });
  });

  app.use(ToastService);
  app.use(ConfirmationService);
  app.directive('tooltip', Tooltip);
}
