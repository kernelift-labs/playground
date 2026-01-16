import type { SystemRouteMeta } from '@kernelift/core';
import { type RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home-view.vue'),
    meta: {
      id: 'home',
      title: 'Home',
      requiresAuth: false,
      isThirdParty: false
    } as SystemRouteMeta
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: () => import('@/views/ai-chat/index.vue'),
    meta: {
      id: 'ai-chat',
      title: 'AI Chat',
      requiresAuth: false,
      isThirdParty: false
    } as SystemRouteMeta
  },
  {
    path: '/markdown-editor',
    name: 'markdown-editor',
    component: () => import('@/views/markdown-editor.vue'),
    meta: {
      id: 'markdown-editor',
      title: 'Markdown Editor',
      requiresAuth: false,
      isThirdParty: false
    } as SystemRouteMeta
  },
  {
    path: '/rsa-oaep',
    name: 'rsa-oaep',
    component: () => import('@/views/rsa-oaep.vue'),
    meta: {
      id: 'rsa-oaep',
      requiresAuth: false,
      hideLayout: true,
      title: 'RSA-OAEP Tool',
      i18nTitleKey: 'routes.tools.rsaOaep',
      isThirdParty: false,
      openType: 'internal'
    } as SystemRouteMeta
  },
  {
    path: '/aes-gcm',
    name: 'aes-gcm',
    component: () => import('@/views/aes-gcm.vue'),
    meta: {
      id: 'aes-gcm',
      requiresAuth: false,
      hideLayout: true,
      title: 'AES-GCM Tool',
      i18nTitleKey: 'routes.tools.aesGcm',
      isThirdParty: false,
      openType: 'internal'
    } as SystemRouteMeta
  },
  {
    path: '/color-utils',
    name: 'color-utils',
    component: () => import('@/views/color-utils.vue'),
    meta: {
      id: 'color-utils',
      requiresAuth: false,
      hideLayout: true,
      title: 'Color Utils Tool',
      i18nTitleKey: 'routes.tools.colorUtils',
      isThirdParty: false,
      openType: 'internal'
    } as SystemRouteMeta
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/not-found.vue'),
    meta: {
      id: 'not-found',
      title: '404 Not Found',
      requiresAuth: false,
      isThirdParty: false
    } as SystemRouteMeta
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      requiresAuth: false,
      isThirdParty: false
    } as SystemRouteMeta
  }
];
