import axios from 'axios';
import { CHAT_BASE_URL } from './constants';

export const chatService = axios.create({
  baseURL: CHAT_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

chatService.interceptors.request.use((config) => {
  // add auth token
  const CHAT_API_KEY = localStorage.getItem('CHAT_API_KEY') || '';
  config.headers.Authorization = `Bearer ${CHAT_API_KEY}`;

  return config;
});

/**
 * @description 获取模型列表
 */
export function getModelList() {
  return chatService.get<{
    object: 'list';
    data: Array<{
      id: string;
      object: 'model';
      created: number;
      owned_by: string;
    }>;
  }>('/models');
}
