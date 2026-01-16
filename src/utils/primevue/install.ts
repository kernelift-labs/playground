import type { App } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import { getPrimaryColor } from '@/assets/style/theme';
import { StyleConfigs } from '@/constants';
import zhCN from '@/utils/primevue/i18n/zh-CN.json';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';

export function addPrimeVue(app: App, locale = 'zh-CN') {
  const primaryColors = getPrimaryColor(StyleConfigs.PRIMARY_COLOR);
  const MyPreset = definePreset(Aura, {
    semantic: {
      primary: primaryColors
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
  app.use(ToastService);
  app.use(ConfirmationService);
  app.directive('tooltip', Tooltip);
}
