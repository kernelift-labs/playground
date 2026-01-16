<script setup lang="ts">
import { useTheme } from '@kernelift/core';

const { loadThemeMode } = useTheme();
loadThemeMode();
</script>

<template>
  <div class="w-full h-full relative overflow-auto">
    <RouterView></RouterView>
  </div>
</template>
