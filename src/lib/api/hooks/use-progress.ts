import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { useRef } from 'react';

interface UpdateProgressParams {
    lessonId: string;
    lastPositionSeconds: number;
    isVideoCompleted?: boolean;
}

export function useLessonProgress() {
    const queryClient = useQueryClient();
    const lastUpdateArgs = useRef<string>('');

    return useMutation({
        mutationFn: async (params: UpdateProgressParams) => {
            // Simple deduping to prevent blasting the same second multiple times
            const argsKey = `${params.lessonId}-${Math.floor(params.lastPositionSeconds / 5)}-${params.isVideoCompleted}`;
            if (argsKey === lastUpdateArgs.current && !params.isVideoCompleted) {
                return; // Skip if we just updated this roughly same timestamp and not completing
            }
            lastUpdateArgs.current = argsKey;

            const { data } = await apiClient.post(`/progress/lesson/${params.lessonId}`, {
                lastPositionSeconds: params.lastPositionSeconds,
                isVideoCompleted: params.isVideoCompleted
            });
            return data;
        },
        onSuccess: (_, variables) => {
            // Invalidate queries to refresh UI state
            // We invalidate 'curriculum' because it might contain the progress data (in future)
            // We invalidate 'progress' which is the course-level progress
            // Note: We avoid aggressive invalidation during playback to prevent UI flicker
            if (variables.isVideoCompleted) {
                queryClient.invalidateQueries({ queryKey: ['progress'] });
                queryClient.invalidateQueries({ queryKey: ['curriculum'] });
                queryClient.invalidateQueries({ queryKey: ['my-courses'] });
            }
        },
    });
}
