import { useEffect, useState } from 'react';
import type { Block } from '@/api/types';
import { getBlocksByLessonID } from '@/api/lessons';

export function useBlocks(lessonId: number) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                const response = await getBlocksByLessonID(lessonId);
                setBlocks(response.data.blocks);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки блоков');
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) fetchBlocks();
    }, [lessonId]);

    return { blocks, isLoading, error };
}