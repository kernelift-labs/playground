import App from '@/App.vue';
import { SystemConfigs } from '@/constants';
import { routes } from '@/router';
import { initKernelift } from '@kernelift/core';
import { createApp } from 'vue';
import type { Router } from 'vue-router';
import type { Pinia } from 'pinia';
import type { AxiosInstance } from 'axios';

// Export global instances
export let router: Router;
export let pinia: Pinia;
export let service: AxiosInstance;

/**
 * @description 初始化应用
 * @returns
 */
export function initApp() {
  const app = createApp(App);
  const result = initKernelift(app, {
    routes: routes,
    system: {
      info: {
        name: SystemConfigs.APP_NAME,
        description: SystemConfigs.APP_DESCRIPTION
      },
      config: {
        baseUrl: SystemConfigs.APP_ROUTE_PREFIX,
        // When MSW is enabled, use empty base URL so MSW can intercept requests
        apiBaseUrl: SystemConfigs.APP_MOCK_ENABLE ? '' : SystemConfigs.APP_API_URL,
        platformCode: SystemConfigs.APP_PLATFORM_CODE,
        timeout: SystemConfigs.APP_API_TIMEOUT
      }
    }
  });

  router = result.router;
  pinia = result.pinia;
  service = result.service;

  return { app, ...result };
}
