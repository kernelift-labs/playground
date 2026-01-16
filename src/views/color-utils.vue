<template>
  <div class="p-4 flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold">Color Utils</h2>
    </div>

    <!-- Hex to RGB Converter -->
    <div class="card p-4 border rounded-lg shadow-sm bg-surface-0 dark:bg-surface-900">
      <h3 class="text-lg font-semibold mb-4">Hex to RGB Converter</h3>
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex flex-col gap-2 flex-1">
          <label for="hexInput" class="font-medium">Hex Color</label>
          <div class="p-inputgroup flex-1">
            <span class="p-inputgroup-addon">#</span>
            <InputText
              id="hexInput"
              v-model="hexInput"
              placeholder="e.g. 409eff"
              @input="convertHexToRgb"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <label class="font-medium">RGB Result</label>
          <InputText v-model="rgbResult" readonly placeholder="rgb(r, g, b)" />
        </div>
        <div
          class="w-12 h-12 rounded border border-surface-300 dark:border-surface-600 shadow-sm"
          :style="{ backgroundColor: validHexColor }"
        ></div>
      </div>
    </div>

    <!-- Palette Generator -->
    <div class="card p-4 border rounded-lg shadow-sm bg-surface-0 dark:bg-surface-900">
      <h3 class="text-lg font-semibold mb-4">Palette Generator</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="flex flex-col gap-2">
          <label for="primaryColor" class="font-medium">Primary Color</label>
          <div class="p-inputgroup flex-1">
            <span class="p-inputgroup-addon">#</span>
            <InputText id="primaryColor" v-model="primaryColor" placeholder="e.g. 409eff" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label for="levels" class="font-medium">Levels</label>
          <InputNumber id="levels" v-model="levels" :min="3" :max="20" showButtons />
        </div>
        <div class="flex flex-col gap-2">
          <label for="targetIndex" class="font-medium">Target Index (500)</label>
          <InputNumber
            id="targetIndex"
            v-model="targetIndex"
            :min="0"
            :max="levels - 1"
            showButtons
          />
        </div>
        <div class="flex items-end">
          <Button label="Generate Palette" @click="generatePalette" class="w-full" />
        </div>
      </div>

      <div
        v-if="palette.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6"
      >
        <div
          v-for="(color, index) in palette"
          :key="index"
          class="flex flex-col items-center gap-2 p-3 rounded border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow"
        >
          <div class="w-full h-16 rounded shadow-inner" :style="{ backgroundColor: color }"></div>
          <div class="text-sm font-mono select-all">{{ color }}</div>
          <div class="text-xs text-surface-500">Level {{ getLevelLabel(index) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ColorUtils">
import { ref, computed, watch } from 'vue';
import { hexToRgb, generateLightColors } from '@kernelift/utils';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

// Hex to RGB
const hexInput = ref('409eff');
const rgbResult = ref('');

const validHexColor = computed(() => {
  const hex = hexInput.value.replace('#', '');
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    return '#' + hex;
  }
  return 'transparent';
});

function convertHexToRgb() {
  try {
    const hex = hexInput.value;
    if (!hex) {
      rgbResult.value = '';
      return;
    }
    const rgb = hexToRgb(hex);
    rgbResult.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  } catch {
    rgbResult.value = 'Invalid Hex';
  }
}

// Initialize
convertHexToRgb();

// Palette Generator
const primaryColor = ref('409eff');
const levels = ref(11);
const targetIndex = ref(5);
const palette = ref<string[]>([]);

function generatePalette() {
  try {
    if (!primaryColor.value) return;
    palette.value = generateLightColors(primaryColor.value, levels.value, 1.0, targetIndex.value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Error generating palette: ' + e.message);
  }
}

function getLevelLabel(index: number) {
  // Assuming standard material design like steps: 50, 100, 200...
  // If levels is 11, we map 0->50, 1->100, ... 10->950
  if (levels.value === 11) {
    if (index === 0) return '50';
    if (index === 10) return '950';
    return (index * 100).toString();
  }
  return index.toString();
}

// Initial generation
watch(validHexColor, (newVal) => {
  if (newVal !== 'transparent') {
    // Sync primary color with hex input for convenience
    primaryColor.value = newVal.replace('#', '');
  }
});
</script>

<style lang="scss" scoped></style>
