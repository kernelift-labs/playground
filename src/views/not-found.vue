<script lang="ts" setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="error-page w-full h-full flex flex-col justify-center items-center p-4">
    <Card class="max-w-2xl w-full shadow-lg">
      <template #header>
        <div
          class="flex justify-center items-center py-8 bg-linear-to-br from-primary-50 to-primary-100"
        >
          <div class="text-center">
            <h1 class="text-9xl font-bold text-primary mb-2">404</h1>
          </div>
        </div>
      </template>
      <template #content>
        <div class="text-center py-6">
          <h2 class="text-3xl font-semibold text-surface-700 mb-3">页面未找到</h2>
          <p class="text-lg text-surface-600 mb-2">抱歉，您访问的页面不存在。</p>
          <p class="text-base text-surface-500">请检查 URL 是否正确，或返回浏览。</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-center gap-3 pb-4">
          <Button
            label="返回首页"
            icon="pi pi-home"
            severity="primary"
            @click="goHome"
            size="large"
          />
          <Button
            label="返回上一页"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="goBack"
            size="large"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.error-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  min-height: 100vh;
}
</style>
