import type { ChatProps } from '@kernelift/ai-chat';

export type ChatOptions = Omit<ChatProps, 'messages' | 'loading'>;
