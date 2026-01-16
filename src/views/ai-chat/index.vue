<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { ChatContainer } from '@kernelift/ai-chat';
import { useChat } from './use-chat';
import '@kernelift/ai-chat/style.css';
import { CHAT_BASE_URL, CHAT_DEFAULT_MODEL } from './constants';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useStorage } from '@vueuse/core';

defineOptions({
  name: 'AiChat'
});

const CHAT_API_KEY = useStorage('CHAT_API_KEY', ''); // 从本地存储获取 API Key

const {
  isNewRecord,
  chatModel,
  availableModels,
  showWorkspace,
  userQuestion,
  chatRecords,
  chatMessages,
  generateLoading,
  senderLoading,
  isLoadingModels,
  handleSend,
  handleCancel,
  chatRecordActions,
  handleChangeRecord,
  handleCreateRecord,
  changeShowWorkspace,
  changeModel,
  showEditNameDialog,
  editRecord,
  updateRecordName,

  bubbleEventActions,
  handleBubbleEvent,

  themeMode,
  changeThemeMode,

  showMessageDetailDialog,
  messageDetail,
  showEditMessageDialog,
  editMessage,
  handleEditMessageContent,
  activeRecordId,
  showEditPromptDialog,
  editPromptRecord,
  promptContent,
  updateRecordPrompt,
  handleShowEditPrompt
} = useChat({
  apiKey: CHAT_API_KEY.value,
  baseURL: CHAT_BASE_URL,
  uuid: 'openai',
  model: CHAT_DEFAULT_MODEL
});

const tempEditContent = ref('');
const isRecording = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let recognition: any = null;

const showApiKeyDialog = ref(false);
const tempApiKey = ref('');

function toggleSpeech() {
  if (isRecording.value) {
    if (recognition) {
      recognition.stop();
    }
    isRecording.value = false;
    return;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('当前浏览器不支持语音输入');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording.value = true;
  };

  recognition.onend = () => {
    isRecording.value = false;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        userQuestion.value += event.results[i][0].transcript;
      }
    }
  };

  recognition.start();
}

watch(showEditMessageDialog, (val) => {
  if (val && editMessage.value) {
    tempEditContent.value = editMessage.value.content;
  }
});

/**
 * 处理键盘事件
 * Enter: 发送消息
 * Shift + Enter: 换行
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleKeydown(event: KeyboardEvent, execute: any) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    execute();
  }
  // Shift + Enter 默认行为（换行）会自动生效
}

function checkApiKey() {
  if (!CHAT_API_KEY.value || CHAT_API_KEY.value.trim() === '') {
    showApiKeyDialog.value = true;
  }
}

function saveApiKey() {
  if (tempApiKey.value && tempApiKey.value.trim() !== '') {
    CHAT_API_KEY.value = tempApiKey.value.trim();
    showApiKeyDialog.value = false;
    tempApiKey.value = '';

    nextTick(() => {
      location.reload();
    });
  }
}

onMounted(() => {
  checkApiKey();
});
</script>

<template>
  <div class="w-full h-full relative ai-chat-view">
    <ChatContainer
      v-model="userQuestion"
      v-model:loading="senderLoading"
      v-model:messages="chatMessages"
      v-model:record-id="activeRecordId"
      :records="chatRecords"
      :is-generate-loading="generateLoading"
      :primary-color="themeMode === 'dark' ? '#42ab52' : '#7624fe'"
      :show-workspace="showWorkspace"
      :markdown-class-name="`prose ${themeMode === 'dark' ? 'prose-invert' : ''}`"
      :has-sender-tools="true"
      uuid="openai"
      has-theme-mode
      :theme-mode="themeMode"
      :input-height="180"
      :default-input-height="80"
      :record-actions="chatRecordActions"
      :bubble-ext-events="bubbleEventActions"
      @send="handleSend"
      @cancel="handleCancel"
      @change-record="handleChangeRecord"
      @clear="handleCreateRecord"
      @close-workspace="showWorkspace = false"
      @bubble-event="handleBubbleEvent"
      @change-theme="changeThemeMode"
    >
      <template #logo>
        <div class="mt-2 mb-3">
          <img
            src="./logo.avif"
            alt="logo"
            style="width: 7.5rem; height: 1.1rem"
            :style="themeMode === 'dark' ? { filter: 'invert(1)' } : {}"
          />
        </div>
      </template>

      <template #header-logo>
        <div class="mx-2">
          <img
            src="./logo.avif"
            alt="header-logo"
            style="width: 8.8rem; height: 1.3rem"
            :style="themeMode === 'dark' ? { filter: 'invert(1)' } : {}"
          />
        </div>
      </template>

      <template #send-button="{ state, execute }">
        <Button
          size="small"
          :disabled="!state.inputText && !state.loading"
          rounded
          :icon="state.loading ? 'pi pi-stop' : 'pi pi-send'"
          :aria-label="state.loading ? 'Cancel' : 'Send'"
          @click="execute"
        />
      </template>

      <template #think-button="{ state, execute }">
        <Button
          size="small"
          :severity="state.enableThink ? undefined : 'secondary'"
          variant="outlined"
          icon="pi pi-lightbulb"
          rounded
          label="深度思考"
          :style="
            state.enableThink
              ? {
                  background: 'rgba(var(--kl-chat-primary-rgb), 0.1)',
                  height: '2rem'
                }
              : {
                  height: '2rem'
                }
          "
          @click="execute"
        ></Button>
      </template>

      <template #sender-textarea="{ height, execute }">
        <Textarea
          v-model="userQuestion"
          class="w-full sender-textarea"
          :class="{ 'dark-textarea': themeMode === 'dark' }"
          :style="{
            height: height + 'px',
            resize: 'none',
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
            '--p-textarea-padding-x': '0.3rem'
          }"
          @keydown="handleKeydown($event, execute)"
        ></Textarea>
      </template>

      <template #empty>
        <div class="flex items-center justify-center flex-col">
          <img
            src="./logo.avif"
            alt="header-logo"
            :style="
              themeMode === 'dark' ? { width: '10rem', filter: 'invert(1)' } : { width: '10rem' }
            "
          />
          <div class="p-4 text-center text-surface-600 dark:text-gray-300">
            本工程基于硅基流动API进行开发，提供智能对话服务，支持多种模型选择与个性化配置。
          </div>
        </div>
      </template>

      <template #new-chat-button="{ execute, disabled }">
        <Button
          label="新建对话"
          icon="pi pi-plus"
          class="w-full"
          rounded
          :disabled="disabled"
          style="height: 2.5rem"
          @click="execute"
        ></Button>
      </template>

      <template #sender-tools>
        <div class="h-9 w-full flex items-center gap-2 px-3">
          <div>
            <!-- 模型选择 -->
            <Select
              v-model="chatModel"
              :options="availableModels"
              option-label="label"
              option-value="value"
              size="small"
              filter
              placeholder="选择模型"
              style="border-radius: 0.9rem"
              :class="{ 'dark-select': themeMode === 'dark' }"
              :loading="isLoadingModels"
              :disabled="senderLoading"
              append-to=".ai-chat-view"
              overlay-class="text-sm small-dropdown"
              @change="changeModel($event.value)"
            />
          </div>

          <div class="ml-auto">
            <!-- 提示词管理 -->
            <Button
              v-if="activeRecordId"
              icon="pi pi-book"
              class="mr-3"
              size="small"
              rounded
              :variant="showEditPromptDialog ? undefined : 'outlined'"
              @click="() => handleShowEditPrompt()"
            ></Button>
            <Button
              v-if="!isNewRecord"
              icon="pi pi-sitemap"
              size="small"
              rounded
              :variant="showWorkspace ? undefined : 'outlined'"
              @click="changeShowWorkspace"
            />
          </div>
        </div>
      </template>

      <template #bubble-event="{ data }">
        <div class="flex gap-3 ml-auto items-center" v-if="data.role === 'assistant'">
          <div class="chat-bubble__event-item" @click="handleBubbleEvent('delete', data)">
            <i class="pi pi-trash" style="font-size: 0.95rem"></i>
          </div>
          <div class="chat-bubble__event-item" @click="handleBubbleEvent('edit', data)">
            <i class="pi pi-pencil" style="font-size: 0.95rem"></i>
          </div>
        </div>
      </template>

      <template #workspace="{ record: activeRecord }">
        <div class="p-4 h-full overflow-auto" :class="{ 'dark-workspace': themeMode === 'dark' }">
          <div v-if="activeRecord" class="space-y-4">
            <div class="workspace-divider pb-4">
              <h3 class="text-lg font-semibold mb-2">会话信息</h3>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium workspace-label">会话名称</label>
                <p class="mt-1 workspace-text">{{ activeRecord.name }}</p>
              </div>

              <div>
                <label class="text-sm font-medium workspace-label">创建时间</label>
                <p class="mt-1 workspace-text">{{ activeRecord.createTime }}</p>
              </div>

              <div>
                <label class="text-sm font-medium workspace-label">会话ID</label>
                <p class="mt-1 workspace-text text-xs font-mono">{{ activeRecord.id }}</p>
              </div>

              <div>
                <label class="text-sm font-medium workspace-label">消息数量</label>
                <p class="mt-1 workspace-text">{{ chatMessages.length }} 条消息</p>
              </div>

              <div v-if="activeRecord.extraData">
                <label class="text-sm font-medium workspace-label">首条消息</label>
                <p class="mt-1 workspace-text text-sm">{{ activeRecord.content }}</p>
              </div>
            </div>

            <div class="workspace-divider pt-4 mt-4">
              <h4 class="text-sm font-semibold mb-2">会话统计</h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="workspace-card p-3 rounded">
                  <div class="text-xs workspace-label">用户消息</div>
                  <div class="text-lg font-semibold">
                    {{ chatMessages.filter((m) => m.role === 'user').length }}
                  </div>
                </div>
                <div class="workspace-card p-3 rounded">
                  <div class="text-xs workspace-label">AI回复</div>
                  <div class="text-lg font-semibold">
                    {{ chatMessages.filter((m) => m.role === 'assistant').length }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center justify-center h-full text-surface-500">
            <div class="text-center">
              <i class="pi pi-inbox text-4xl mb-3"></i>
              <p>选择一个会话查看详情</p>
            </div>
          </div>
        </div>
      </template>

      <template #sender-footer-tools>
        <Button
          size="small"
          rounded
          :icon="'pi pi-microphone'"
          :severity="isRecording ? 'danger' : 'secondary'"
          @click="toggleSpeech"
        />
      </template>
    </ChatContainer>

    <Dialog
      v-if="editRecord"
      v-model:visible="showEditNameDialog"
      header="编辑会话名称"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-semibold">新名称</label>
          <Textarea
            v-model="editRecord.name"
            rows="2"
            class="w-full"
            placeholder="输入新的会话名称"
          />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="取消"
            icon="pi pi-times"
            severity="secondary"
            @click="showEditNameDialog = false"
          />
          <Button
            label="保存"
            icon="pi pi-save"
            @click="
              updateRecordName(editRecord, editRecord.name);
              showEditNameDialog = false;
            "
          />
        </div>
      </div>
    </Dialog>

    <!-- 消息详情弹窗 -->
    <Dialog
      v-if="messageDetail"
      v-model:visible="showMessageDetailDialog"
      header="消息详情"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-3">
        <div>
          <label class="text-sm font-medium text-surface-600 dark:text-surface-400">消息ID</label>
          <div
            class="mt-1 p-2 bg-surface-50 dark:bg-surface-700 rounded text-xs font-mono break-all border border-surface-200"
          >
            {{ messageDetail.id }}
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-surface-600 dark:text-surface-400">角色</label>
          <div class="mt-1">
            <span
              :class="{
                'bg-blue-100 text-blue-700': messageDetail.role === 'user',
                'bg-purple-100 text-purple-700': messageDetail.role === 'assistant'
              }"
              class="px-2 py-1 rounded text-xs font-medium"
            >
              {{ messageDetail.role }}
            </span>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-surface-600 dark:text-surface-400">发送时间</label>
          <div class="mt-1 text-sm text-surface-900 dark:text-surface-300">
            {{ new Date(messageDetail.timestamp).toLocaleString() }}
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-surface-600 dark:text-surface-400">内容统计</label>
          <div class="mt-1 text-sm text-surface-900 dark:text-surface-300">
            {{ messageDetail.content.length }} 字符
          </div>
        </div>
        <div v-if="messageDetail.extraData && Object.keys(messageDetail.extraData).length > 0">
          <label class="text-sm font-medium text-surface-600 dark:text-surface-400">元数据</label>
          <pre
            class="mt-1 text-xs bg-surface-50 dark:bg-surface-700 p-2 rounded overflow-auto border border-surface-200 max-h-40"
            >{{ JSON.stringify(messageDetail.extraData, null, 2) }}</pre
          >
        </div>
      </div>
    </Dialog>

    <!-- 编辑消息弹窗 -->
    <Dialog
      v-if="editMessage"
      v-model:visible="showEditMessageDialog"
      header="编辑消息内容"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      :style="{ width: '600px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-sm">消息内容</label>
          <Textarea
            v-model="tempEditContent"
            rows="10"
            class="w-full font-mono text-sm leading-relaxed"
            style="resize: vertical; min-height: 200px"
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            severity="secondary"
            @click="showEditMessageDialog = false"
          />
          <Button
            label="保存"
            icon="pi pi-save"
            @click="
              handleEditMessageContent(tempEditContent);
              showEditMessageDialog = false;
            "
          />
        </div>
      </div>
    </Dialog>

    <!-- 编辑提示词弹窗 -->
    <Dialog
      v-model:visible="showEditPromptDialog"
      modal
      header="设置提示词"
      :style="{ width: '50rem' }"
    >
      <div class="flex flex-col gap-4">
        <label for="prompt" class="font-semibold text-lg">系统提示词</label>
        <Textarea
          id="prompt"
          v-model="promptContent"
          rows="10"
          placeholder="请输入系统提示词，这将作为 System Message 发送给模型..."
          class="w-full"
        />
      </div>
      <template #footer>
        <Button label="取消" text severity="secondary" @click="showEditPromptDialog = false" />
        <Button
          label="保存"
          @click="
            () => {
              if (editPromptRecord) {
                updateRecordPrompt(editPromptRecord, promptContent);
              }
              showEditPromptDialog = false;
            }
          "
        />
      </template>
    </Dialog>

    <!-- API Key 输入弹窗 -->
    <Dialog
      v-model:visible="showApiKeyDialog"
      header="API Key 配置"
      :modal="true"
      :closable="false"
      :dismissable-mask="false"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="text-sm text-surface-600 mb-2">
          <i class="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
          请输入您的 API Key 以使用 AI 对话功能。
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-semibold">API Key</label>
          <Textarea
            v-model="tempApiKey"
            rows="3"
            class="w-full"
            placeholder="请输入您的 API Key"
            @keydown="handleKeydown($event, saveApiKey)"
          />
        </div>
        <div class="flex justify-end gap-2 mt-2">
          <Button
            label="保存"
            icon="pi pi-check"
            :disabled="!tempApiKey || tempApiKey.trim() === ''"
            @click="saveApiKey"
          />
        </div>
      </div>
    </Dialog>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<style lang="scss" scoped>
.chat-bubble__event-item {
  padding: 0.25rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  // width: 1.625rem;
  // height: 1.625rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &:active {
    color: #6b7280; // gray-500
    background-color: rgba(var(--kl-chat-primary-rgb), 0.13);
  }

  // 只有支持悬停的设备才应用悬停效果
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: #6b7280; // gray-500
      background-color: rgba(var(--kl-chat-primary-rgb), 0.13);
    }
  }
}
</style>

<style>
:root {
  --p-primary-50: #f5f3ff;
  --p-primary-100: #ede9fe;
  --p-primary-200: #ddd6fe;
  --p-primary-300: #c4b5fd;
  --p-primary-400: #a78bfa;
  --p-primary-500: #7624fe;
  --p-primary-600: #6b21d8;
  --p-primary-700: #5b21b6;
  --p-primary-800: #4c1d95;
  --p-primary-900: #3b1a7a;
  --p-primary-950: #2e1065;
}

html.dark {
  --p-primary-50: #e8f5ea;
  --p-primary-100: #c6e6ca;
  --p-primary-200: #a0d6a8;
  --p-primary-300: #79c686;
  --p-primary-400: #5eb96c;
  --p-primary-500: #42ab52;
  --p-primary-600: #3c9d4b;
  --p-primary-700: #338a41;
  --p-primary-800: #2b7837;
  --p-primary-900: #1d5825;
  --p-primary-950: #0f2f14;
}

/* Dark mode styles for textarea */
.dark-textarea {
  background-color: #4a4a4a !important;
  color: #ffffff !important;
}

/* Dark mode styles for select */
.dark-select {
  background-color: #4a4a4a !important;
  color: #ffffff !important;
}

/* Dark mode workspace styles */
.dark-workspace {
  .workspace-label {
    color: #9ca3af !important;
  }

  .workspace-text {
    color: #e5e7eb !important;
  }

  .workspace-divider {
    border-color: #4a4a4a !important;
  }

  .workspace-card {
    background-color: #3a3a3a !important;
    border: 1px solid #4a4a4a !important;
  }
}

.workspace-divider {
  border-bottom: 1px solid #e5e7eb;
  border-top: 1px solid #e5e7eb;
}

.workspace-label {
  color: #6b7280;
}

.workspace-text {
  color: #111827;
}

.workspace-card {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.small-dropdown {
  border-radius: 1rem !important;
  overflow: hidden;
}

.small-dropdown .p-inputtext {
  padding-block: 0.3rem; /* 调整内边距以适应较小的字体 */
}
</style>
