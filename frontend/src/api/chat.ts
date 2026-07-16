import { useMutation } from '@tanstack/react-query';
import api from './axios';
import type { ChatResponse } from '../lib/types';

/* =========================================
   Chat API hooks — POST /api/chat/{courseId}
   ========================================= */

interface SendMessageParams {
  courseId: number | string;
  message: string;
  conversationId?: string;
}

/** POST /api/chat/{courseId} — send a message to the RAG assistant */
export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ courseId, message, conversationId }: SendMessageParams) => {
      const res = await api.post<ChatResponse>(`/api/chat/${courseId}`, {
        message,
        conversationId: conversationId ?? undefined,
      });
      return res.data;
    },
  });
}
