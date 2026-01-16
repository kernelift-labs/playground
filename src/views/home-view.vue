<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';

const router = useRouter();

// 获取所有路由，过滤掉不需要显示的
const displayRoutes = computed(() => {
  return router
    .getRoutes()
    .filter((route) => {
      // 过滤掉当前页面、404页面、通配符路由和没有名称的路由
      return (
        route.name !== 'home' &&
        route.name !== 'not-found' &&
        !route.path.includes('*') &&
        route.name &&
        route.meta?.title
      );
    })
    .map((route) => ({
      name: route.name,
      path: route.path,
      title: (route.meta?.title as string) || route.name,
      icon: getRouteIcon(route.name as string)
    }));
});

function getRouteIcon(name: string): string {
  const iconMap: Record<string, string> = {
    'ai-chat': 'pi pi-comments',
    'markdown-editor': 'pi pi-file-edit',
    'rsa-oaep': 'pi pi-lock',
    'aes-gcm': 'pi pi-shield',
    'color-utils': 'pi pi-palette'
  };
  return iconMap[name] || 'pi pi-box';
}

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="min-h-screen bg-surface-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl sm:text-5xl font-bold text-surface-900 mb-4">Kernelift Playground</h1>
        <p class="text-lg text-surface-600 max-w-2xl mx-auto">
          探索各种工具和功能，选择一个应用开始使用
        </p>
      </div>

      <!-- Routes Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="route in displayRoutes"
          :key="route.name"
          class="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          @click="navigateTo(route.path)"
        >
          <template #header>
            <div class="flex items-center justify-center pt-8 pb-4">
              <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <i :class="route.icon" class="text-3xl text-primary-600"></i>
              </div>
            </div>
          </template>
          <template #title>
            <div class="text-center text-xl font-semibold text-surface-900">
              {{ route.title }}
            </div>
          </template>
          <template #content>
            <div class="text-center pb-4">
              <Button
                label="打开"
                icon="pi pi-arrow-right"
                icon-pos="right"
                class="w-full"
                @click.stop="navigateTo(route.path)"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Footer -->
      <div class="text-center mt-16 text-surface-500 text-sm">
        <p>
          © 2026 Kernelift Playground.
          <a
            href="https://github.com/kernelift-labs/playground"
            target="_blank"
            rel="noopener noreferrer"
            >Github Site</a
          >.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 响应式调整 */
@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}
</style>
