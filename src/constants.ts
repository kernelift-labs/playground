/**
 * @description 系统相关常量
 */
export const SystemConfigs = {
  APP_ROUTE_PREFIX: import.meta.env.VITE_APP_ROUTE_PREFIX || '/',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Kernelift',
  APP_API_URL: import.meta.env.VITE_APP_API_URL || '/api',
  APP_PLATFORM_CODE: import.meta.env.VITE_APP_PLATFORM_CODE || 'kernelift',
  APP_API_TIMEOUT: import.meta.env.VITE_APP_API_TIMEOUT
    ? Number(import.meta.env.VITE_APP_API_TIMEOUT)
    : 15000,
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Lifting core ideas',
  APP_MOCK_ENABLE: import.meta.env.VITE_APP_MOCK_ENABLE === 'true'
};

/**
 * @description 样式类名前缀
 */
export const StyleConfigs = {
  PREFIX: import.meta.env.VITE_APP_STYLE_PREFIX || '',
  PRIMARY_COLOR: import.meta.env.VITE_APP_STYLE_PRIMARY_COLOR || '#4F46E5',
  PRIMARY_COLOR_DARK: import.meta.env.VITE_APP_STYLE_PRIMARY_COLOR_DARK || '#055cc5'
};
