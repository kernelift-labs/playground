<script setup lang="ts">
import { ref, computed } from 'vue';
import { MdEditor } from '@kernelift/md-editor';
import '@kernelift/md-editor/style.css';
import { MdRender } from '@kernelift/markdown';
import '@kernelift/markdown/style.css';

defineOptions({
  name: 'MarkdownEditPage'
});

const content = ref(`# Welcome to Markdown Editor

## Features
- 📝 **Live Preview**: Real-time markdown rendering
- 💻 **Split View**: Edit and preview side by side
- 📱 **Mobile Friendly**: Responsive design for all devices
- 🎨 **Syntax Highlighting**: Code blocks with beautiful colors
- 🌓 **Theme Support**: Light and dark mode

## Example Code

\`\`\`typescript
function hello(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(hello('World'));
\`\`\`

## Markdown Syntax

### Lists
- Item 1
- Item 2
  - Nested item
  - Another nested item

### Table
| Feature | Support |
|---------|---------|
| Editor  | ✅      |
| Preview | ✅      |
| Mobile  | ✅      |

### Quote
> This is a blockquote
> It can span multiple lines

---

**Start editing to see the preview!**
`);

// Layout state
const viewMode = ref<'split' | 'edit' | 'preview'>('split');
const isMobile = ref(false);
const isFullscreen = ref(false);

// Theme
const isDark = ref(false);

// Check if mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  // Auto switch to edit mode on mobile
  if (isMobile.value && viewMode.value === 'split') {
    viewMode.value = 'edit';
  }
};

// Initialize
if (typeof window !== 'undefined') {
  checkMobile();
  window.addEventListener('resize', checkMobile);
}

// Computed classes
const containerClass = computed(() => ({
  'md-editor-container': true,
  'is-mobile': isMobile.value,
  'is-fullscreen': isFullscreen.value,
  'is-dark': isDark.value,
  [`view-${viewMode.value}`]: true
}));

// Toggle fullscreen
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// Toggle theme
const toggleTheme = () => {
  isDark.value = !isDark.value;
};

// Export markdown
const exportMarkdown = () => {
  const blob = new Blob([content.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `markdown-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

// Copy code callback
const handleCopy = (code: string) => {
  navigator.clipboard.writeText(code);
  console.log('Code copied!');
};
</script>

<template>
  <div :class="containerClass">
    <!-- Toolbar -->
    <div class="md-toolbar">
      <div class="md-toolbar__left">
        <h1 class="md-toolbar__title">Markdown Editor</h1>
      </div>

      <div class="md-toolbar__center">
        <!-- View Mode Switcher (Hidden on mobile) -->
        <div v-if="!isMobile" class="md-view-switcher">
          <button
            :class="{ active: viewMode === 'edit' }"
            @click="viewMode = 'edit'"
            title="Edit Only"
          >
            <span class="material-symbols--edit-square"></span>
            <span class="label">Edit</span>
          </button>
          <button
            :class="{ active: viewMode === 'split' }"
            @click="viewMode = 'split'"
            title="Split View"
          >
            <span class="material-symbols--view-column-2"></span>
            <span class="label">Split</span>
          </button>
          <button
            :class="{ active: viewMode === 'preview' }"
            @click="viewMode = 'preview'"
            title="Preview Only"
          >
            <span class="material-symbols--preview"></span>
            <span class="label">Preview</span>
          </button>
        </div>

        <!-- Mobile View Switcher -->
        <div v-else class="md-view-switcher mobile">
          <button :class="{ active: viewMode === 'edit' }" @click="viewMode = 'edit'">
            <span class="material-symbols--edit-square"></span>
          </button>
          <button :class="{ active: viewMode === 'preview' }" @click="viewMode = 'preview'">
            <span class="material-symbols--preview"></span>
          </button>
        </div>
      </div>

      <div class="md-toolbar__right">
        <button
          class="md-toolbar__btn"
          @click="toggleTheme"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <span v-if="isDark" class="material-symbols--light-mode"></span>
          <span v-else class="material-symbols--dark-mode"></span>
        </button>
        <button class="md-toolbar__btn" @click="exportMarkdown" title="Export Markdown">
          <span class="material-symbols--download"></span>
        </button>
        <button
          class="md-toolbar__btn"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
        >
          <span v-if="isFullscreen" class="material-symbols--close-fullscreen"></span>
          <span v-else class="material-symbols--fullscreen"></span>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="md-content">
      <!-- Editor Panel -->
      <div v-show="viewMode === 'edit' || viewMode === 'split'" class="md-panel md-panel--editor">
        <div class="md-panel__header">
          <span class="md-panel__title">
            <span class="material-symbols--edit-document"></span>
            Editor
          </span>
          <span class="md-panel__info">{{ content.length }} characters</span>
        </div>
        <div class="md-panel__body">
          <MdEditor
            v-model="content"
            :options="{
              theme: isDark ? 'vs-dark' : 'vs',
              fontSize: isMobile ? 14 : 16
            }"
          />
        </div>
      </div>

      <!-- Divider (Desktop Split View Only) -->
      <div v-if="!isMobile && viewMode === 'split'" class="md-divider"></div>

      <!-- Preview Panel -->
      <div
        v-show="viewMode === 'preview' || viewMode === 'split'"
        class="md-panel md-panel--preview"
        :class="{ 'dark-theme': isDark }"
      >
        <div class="md-panel__header">
          <span class="md-panel__title">
            <span class="material-symbols--visibility"></span>
            Preview
          </span>
        </div>
        <div class="md-panel__body">
          <div class="md-preview-scroll">
            <MdRender
              v-model="content"
              :incremental="true"
              :on-copy="handleCopy"
              class="prose"
              :theme-mode="isDark ? 'dark' : 'light'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.md-editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;

  &.is-dark {
    background: #1e1e1e;
  }

  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
  }
}

// Toolbar
.md-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  gap: 1rem;

  .is-dark & {
    background: #2d2d2d;
    border-bottom-color: #404040;
  }

  &__left,
  &__center,
  &__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__center {
    flex: 1;
    justify-content: center;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;

    .is-dark & {
      color: #f3f4f6;
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    &:active {
      transform: scale(0.95);
    }

    .is-dark & {
      color: #9ca3af;

      &:hover {
        background: #404040;
        color: #f3f4f6;
      }
    }

    span {
      font-size: 1.25rem;
    }
  }
}

// View Switcher
.md-view-switcher {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: #f3f4f6;
  border-radius: 0.5rem;

  .is-dark & {
    background: #404040;
  }

  button {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;

    .is-dark & {
      color: #9ca3af;
    }

    &:hover {
      color: #1f2937;

      .is-dark & {
        color: #f3f4f6;
      }
    }

    &.active {
      background: white;
      color: #3b82f6;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      .is-dark & {
        background: #2d2d2d;
        color: #60a5fa;
      }
    }

    span {
      font-size: 1.125rem;
    }

    .label {
      font-size: 0.875rem;
    }
  }

  &.mobile button {
    padding: 0.5rem;

    .label {
      display: none;
    }
  }
}

// Main Content
.md-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;

  .view-edit & {
    .md-panel--editor {
      flex: 1;
    }
  }

  .view-preview & {
    .md-panel--preview {
      flex: 1;
    }
  }

  .view-split & {
    .md-panel--editor,
    .md-panel--preview {
      flex: 1;
    }
  }
}

// Panel
.md-panel {
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;

  .is-dark & {
    background: #252525;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;

    .is-dark & {
      border-bottom-color: #404040;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;

    .is-dark & {
      color: #d1d5db;
    }

    span {
      font-size: 1.125rem;
    }
  }

  &__info {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  &__body {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  &--preview {
    .md-panel__body {
      overflow: auto;
    }
  }
}

// Preview Scroll
.md-preview-scroll {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

// Divider
.md-divider {
  width: 1px;
  background: #e5e7eb;
  flex-shrink: 0;

  .is-dark & {
    background: #404040;
  }
}

// Dark theme for preview
.dark-theme {
  background: #1a1a1a;
  color: #e5e7eb;
}

// Mobile Specific
.is-mobile {
  .md-toolbar {
    padding: 0.5rem;

    &__title {
      font-size: 1rem;
    }

    &__btn span {
      font-size: 1.125rem;
    }
  }

  .md-panel__header {
    padding: 0.5rem 0.75rem;
  }

  .md-content {
    .md-panel {
      width: 100%;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .md-toolbar__title {
    display: none;
  }

  .md-preview-scroll {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .md-view-switcher button {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;

    span {
      font-size: 1rem;
    }
  }
}
</style>
