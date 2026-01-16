/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BubbleEventAction,
  ChatMessage,
  ChatRecord,
  ChatRecordAction
} from '@kernelift/ai-chat';
import { formatDate, useAsyncState, useStorage } from '@vueuse/core';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { OpenAI } from 'openai/client';
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions/completions.mjs';
import { computed, onUnmounted, ref, shallowRef } from 'vue';
import { getModelList } from './api';
import { useTheme } from '@kernelift/core';

interface ChatError {
  message: string;
  code?: string;
  timestamp: number;
}

interface ReasoningDelta {
  reasoning_content?: string;
}

export const useChat = (options: {
  apiKey: string;
  baseURL?: string;
  model?: string;
  uuid?: string;
}) => {
  const { apiKey, baseURL, model, uuid } = options;
  // 当前显示的消息列表
  const chatMessages = ref<ChatMessage[]>([]);
  // 所有消息记录
  const chatRecords = useStorage<ChatRecord[]>(`${uuid}-records`, []);
  // 显示工作区
  const showWorkspace = ref(false);
  // 发送中
  const senderLoading = ref(false);
  // 生成中
  const generateLoading = ref(false);
  // 新记录Id
  const newRecordId = ref<string | null>(null);
  // 当前激活的记录
  const activeRecordId = ref<string | null>(null);
  // 错误状态
  const lastError = ref<ChatError | null>(null);

  const toast = useToast();
  const confirm = useConfirm();

  const isNewRecord = computed(() => {
    return !!newRecordId.value && activeRecordId.value === null;
  });

  // 流式传输
  const streamMode = ref<boolean>(true);
  // 输入问题
  const userQuestion = ref('');
  // 聊天模型
  const chatModel = ref(model || 'deepseek-ai/DeepSeek-V3.1-Terminus');
  // 主题模式
  const { theme: themeMode } = useTheme();

  /**
   * @description 切换主题模式
   * @param mode
   */
  function changeThemeMode() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light';
  }

  /**
   * @description 切换模型
   * @param newModel
   */
  function changeModel(newModel: string) {
    chatModel.value = newModel;
  }

  /**
   * @description 切换工作区显示状态
   */
  function changeShowWorkspace() {
    showWorkspace.value = !showWorkspace.value;
  }

  /**
   * @description 切换流式传输模式
   * @param isStream
   */
  function changeStreamMode(isStream: boolean) {
    streamMode.value = isStream;
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    // 危险，此处仅作为示范使用
    dangerouslyAllowBrowser: true
  });

  /**
   * @description 创建错误消息
   */
  function createErrorMessage(error: unknown): ChatError {
    let message = '请求失败，请稍后重试';
    let code: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      if ('code' in error) {
        code = String(error.code);
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    // Handle specific error types
    if (message.includes('abort')) {
      message = '请求已取消';
      code = 'ABORTED';
    } else if (message.includes('network')) {
      message = '网络连接失败，请检查网络设置';
      code = 'NETWORK_ERROR';
    } else if (message.includes('timeout')) {
      message = '请求超时，请稍后重试';
      code = 'TIMEOUT';
    } else if (message.includes('401')) {
      message = 'API密钥无效，请检查配置';
      code = 'UNAUTHORIZED';
    } else if (message.includes('429')) {
      message = '请求过于频繁，请稍后再试';
      code = 'RATE_LIMIT';
    }

    return {
      message,
      code,
      timestamp: Date.now()
    };
  }

  /**
   * @description 添加错误消息到聊天记录
   */
  function addErrorMessage(error: ChatError) {
    const lastMessage = chatMessages.value[chatMessages.value.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.error = error.message;
      lastMessage.loading = false;
    } else {
      chatMessages.value.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: `<span style="color: red;">${error.message}</span>`,
        timestamp: Date.now(),
        error: error.message,
        isThinking: false
      });
    }
    lastError.value = error;
  }

  // 创建 AbortController
  const controller = shallowRef(new AbortController());

  function getMessagesWithPrompt() {
    const messages = chatMessages.value.map((item) => ({
      role: item.role,
      content: item.content
    }));

    if (activeRecordId.value) {
      const record = chatRecords.value.find((r) => r.id === activeRecordId.value);
      if (record && record.extraData?.prompt) {
        messages.unshift({
          role: 'system',
          content: record.extraData.prompt
        });
      }
    }
    return messages;
  }

  /**
   * @description 发送消息
   * @param value
   * @param enableThink
   * @param enableNet
   * @param needCreateRecord
   */
  async function handleSend(
    value: string,
    enableThink?: boolean,
    enableNet?: boolean,
    needCreateRecord?: boolean
  ) {
    // 0. 清除之前的错误状态
    lastError.value = null;

    // 1. 清空输入框
    userQuestion.value = '';
    // 2. 添加用户输入记录
    chatMessages.value.push({
      id: Date.now().toString(),
      role: 'user',
      content: value,
      timestamp: Date.now(),
      isThinking: enableThink,
      extraData: {
        question: value
      }
    });

    // 3. 如果需要创建记录，立即创建
    if (needCreateRecord) {
      const recordId = newRecordId.value || 'record-' + Date.now().toString();
      newRecordId.value = null;
      chatRecords.value.push({
        id: recordId,
        name: value.slice(0, 30) + (value.length > 30 ? '...' : ''),
        content: value,
        type: 'chat',
        createTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        userId: uuid || 'default',
        extraData: {
          messages: chatMessages.value
        }
      });
      activeRecordId.value = recordId;
    }

    // 4. 添加机器人输入记录
    senderLoading.value = true;
    generateLoading.value = true;
    if (streamMode.value) {
      try {
        const stream = await client.chat.completions.create(
          {
            model: chatModel.value,
            messages: getMessagesWithPrompt() as any,
            stream: true,
            enable_thinking: !!enableThink
          } as ChatCompletionCreateParamsStreaming,
          {
            signal: controller.value.signal
          }
        );
        // 5. 载入响应数据，并关闭生成加载
        generateLoading.value = false;

        const targetId = Date.now().toString();
        chatMessages.value.push({
          id: targetId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isThinking: false,
          extraData: {
            model: chatModel.value,
            userQuestion: value
          }
        });
        const targetMessage = chatMessages.value.find((item) => item.id === targetId)!;
        for await (const chunk of stream) {
          targetMessage.loading = true;
          const delta = chunk.choices[0]?.delta as ReasoningDelta | undefined;

          if (
            enableThink &&
            delta?.reasoning_content &&
            targetMessage.content.length === 0 &&
            !chunk.choices[0]?.delta.content
          ) {
            if (!targetMessage.thoughtProcess) {
              targetMessage.thoughtProcess = '';
            }
            targetMessage.isThinking = true;
            targetMessage.thoughtProcess += delta.reasoning_content || '';
          } else {
            targetMessage.isThinking = false;
          }
          targetMessage.content += chunk.choices[0]?.delta.content || '';
          targetMessage.timestamp = Date.now();
        }
        targetMessage.loading = false;
      } catch (error: unknown) {
        const chatError = createErrorMessage(error);
        const targetMessage = chatMessages.value[chatMessages.value.length - 1];

        if (targetMessage && targetMessage.role === 'assistant') {
          targetMessage.loading = false;
          targetMessage.timestamp = Date.now();
          targetMessage.error = chatError.message;
        } else {
          addErrorMessage(chatError);
        }

        console.error('[AI Chat] Stream request failed:', error);
      } finally {
        senderLoading.value = false;
      }
    } else {
      try {
        const response = await client.chat.completions.create(
          {
            model: chatModel.value,
            messages: getMessagesWithPrompt() as any,
            stream: false
          },
          {
            signal: controller.value.signal
          }
        );

        chatMessages.value.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: response.choices[0]?.message.content || '请求失败，请稍后重试',
          timestamp: Date.now(),
          isThinking: false,
          extraData: {
            model: chatModel.value,
            userQuestion: value
          }
        });
      } catch (error: unknown) {
        const chatError = createErrorMessage(error);
        addErrorMessage(chatError);
        console.error('[AI Chat] Non-stream request failed:', error);
      } finally {
        // 4. 载入响应数据，并关闭生成加载
        senderLoading.value = false;
        generateLoading.value = false;
      }
    }
  }

  /**
   * @description 取消当前请求
   */
  function handleCancel() {
    // 中止当前请求
    controller.value.abort();

    // 创建新的控制器供下次使用
    controller.value = new AbortController();

    // 如果正在生成，标记最后一条消息为已取消
    if (generateLoading.value || senderLoading.value) {
      const lastMessage = chatMessages.value[chatMessages.value.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.loading = false;
        // 如果消息内容为空，添加取消提示
        if (!lastMessage.content && !lastMessage.error) {
          lastMessage.error = '生成已取消';
        }
        lastMessage.timestamp = Date.now();
        lastMessage.content = '生成已取消，请重试。';
      }
    }

    // 重置加载状态
    generateLoading.value = false;
    senderLoading.value = false;

    console.log('[AI Chat] Request cancelled by user');
  }

  onUnmounted(() => {
    controller.value.abort();
  });

  /**
   * @description 重试最后一条失败的消息
   */
  function handleRetry() {
    if (chatMessages.value.length < 2) return;

    const lastAssistantMsg = chatMessages.value[chatMessages.value.length - 1];
    const lastUserMsg = chatMessages.value[chatMessages.value.length - 2];

    if (lastAssistantMsg?.error && lastUserMsg?.role === 'user') {
      // 移除错误的助手消息
      chatMessages.value.pop();
      // 重新发送用户消息
      const userContent = lastUserMsg.content;
      const isThinking = lastUserMsg.isThinking;
      handleSend(userContent, isThinking, false, false);
    }
  }

  /**
   * @description 处理记录变更
   * @param record
   */
  function handleChangeRecord(record?: ChatRecord) {
    if (record) {
      activeRecordId.value = record?.id || null;
      newRecordId.value = null;
    }
    chatMessages.value = record?.extraData?.messages || [];
  }

  function handleCreateRecord() {
    chatMessages.value = [];
    newRecordId.value = 'record-' + Date.now().toString();
    activeRecordId.value = null;
  }
  handleCreateRecord();

  const { state: availableModels, isLoading: isLoadingModels } = useAsyncState(
    async () => {
      const response = await getModelList();
      return response.data.data.map((item) => ({
        label: item.id,
        value: item.id
      }));
    },
    [],
    {
      immediate: true
    }
  );

  const showEditNameDialog = ref(false);
  const editRecord = ref<ChatRecord | null>(null);

  const showEditPromptDialog = ref(false);
  const promptContent = ref('');
  const editPromptRecord = ref<ChatRecord | null>(null);

  function handleShowEditPrompt(record?: ChatRecord) {
    if (record) {
      editPromptRecord.value = record;
      promptContent.value = record.extraData?.prompt || '';
      showEditPromptDialog.value = true;
    } else {
      const activeRecord = chatRecords.value.find((item) => item.id === activeRecordId.value);
      if (activeRecord) {
        editPromptRecord.value = activeRecord;
        promptContent.value = activeRecord.extraData?.prompt || '';
        showEditPromptDialog.value = true;
      }
    }
  }

  const chatRecordActions: ChatRecordAction[] = [
    {
      key: 'prompt',
      label: '提示词',
      icon: 'pi pi-book text-sm',
      handler: (record: ChatRecord) => {
        handleShowEditPrompt(record);
      }
    },
    {
      key: 'edit',
      label: '编辑名称',
      icon: 'pi pi-pencil text-sm',
      handler: (record: ChatRecord) => {
        editRecord.value = record;
        showEditNameDialog.value = true;
      }
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'pi pi-trash text-sm',
      handler: (record: ChatRecord) => {
        confirm.require({
          message: '确定要删除这条对话记录吗？',
          header: '确认删除',
          icon: 'pi pi-exclamation-triangle',
          rejectProps: {
            label: '取消',
            severity: 'secondary',
            text: true
          },
          acceptProps: {
            label: '删除',
            severity: 'danger'
          },
          accept: () => {
            const index = chatRecords.value.findIndex((item) => item.id === record.id);
            if (index !== -1) {
              chatRecords.value.splice(index, 1);
              toast.add({
                severity: 'success',
                summary: '提示',
                detail: '删除成功',
                life: 3000
              });
            }
            // 如果删除的是当前激活的记录，清空消息列表
            if (activeRecordId.value === record.id) {
              chatMessages.value = [];
              activeRecordId.value = null;
            }
          }
        });
      }
    }
  ];

  /**
   * @description 更新记录名称
   * @param record
   * @param newName
   */
  function updateRecordName(record: ChatRecord, newName: string) {
    const targetRecord = chatRecords.value.find((item) => item.id === record.id);
    if (targetRecord) {
      targetRecord.content = newName;
    }
  }

  /**
   * @description 更新记录提示词
   * @param record
   * @param prompt
   */
  function updateRecordPrompt(record: ChatRecord, prompt: string) {
    const targetRecord = chatRecords.value.find((item) => item.id === record.id);
    if (targetRecord) {
      if (!targetRecord.extraData) {
        targetRecord.extraData = {};
      }
      targetRecord.extraData.prompt = prompt;
    }
  }

  const bubbleEventActions: BubbleEventAction[] = [
    {
      key: 'info',
      icon: 'pi pi-info-circle',
      label: '信息'
    }
  ];

  const showMessageDetailDialog = ref(false);
  const messageDetail = ref<ChatMessage | null>(null);

  const showEditMessageDialog = ref(false);
  const editMessage = ref<ChatMessage | null>(null);
  function handleEditMessageContent(newContent: string) {
    if (editMessage.value) {
      editMessage.value.content = newContent;
    }
  }

  function handleBubbleEvent(event: string, data: ChatMessage) {
    switch (event) {
      case 'like':
        data.isLiked = !data.isLiked;
        break;
      case 'dislike':
        data.isDisliked = !data.isDisliked;
        break;
      case 'delete':
        confirm.require({
          message: '确定要删除这条消息吗？',
          header: '确认删除',
          icon: 'pi pi-exclamation-triangle',
          rejectProps: {
            label: '取消',
            severity: 'secondary',
            text: true
          },
          acceptProps: {
            label: '删除',
            severity: 'danger'
          },
          accept: () => {
            const index = chatMessages.value.findIndex((item) => item.id === data.id);
            if (index !== -1) {
              chatMessages.value.splice(index, 1);
              toast.add({
                severity: 'success',
                summary: '提示',
                detail: '删除成功',
                life: 3000
              });
            }
          }
        });
        break;
      case 'terminate':
        handleCancel();
        break;
      case 'reload':
        userQuestion.value = data.extraData?.question || '';
        break;
      case 'copy':
        navigator.clipboard.writeText(data.content || '').then(() => {
          toast.add({
            severity: 'success',
            summary: '提示',
            detail: '复制成功',
            life: 3000
          });
        });
        break;
      case 'edit':
        editMessage.value = data;
        showEditMessageDialog.value = true;
        break;
      case 'info':
        messageDetail.value = data;
        showMessageDetailDialog.value = true;
        break;
      default:
        break;
    }
  }

  return {
    bubbleEventActions,
    chatRecordActions,
    isLoadingModels,
    chatMessages,
    chatRecords,
    showWorkspace,
    senderLoading,
    generateLoading,
    activeRecordId,
    streamMode,
    userQuestion,
    lastError,
    themeMode,
    handleCreateRecord,
    isNewRecord,
    chatModel,
    availableModels,
    changeThemeMode,
    changeModel,
    handleSend,
    handleCancel,
    handleRetry,
    handleChangeRecord,
    changeShowWorkspace,
    changeStreamMode,

    showEditNameDialog,
    editRecord,
    updateRecordName,

    showEditPromptDialog,
    editPromptRecord,
    promptContent,
    updateRecordPrompt,
    handleShowEditPrompt,

    handleBubbleEvent,
    showMessageDetailDialog,
    messageDetail,
    showEditMessageDialog,
    editMessage,
    handleEditMessageContent
  };
};
