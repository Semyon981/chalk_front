import { useEffect, useState } from 'react';
import type { Lesson } from '@/api/types';
import { getLessonByID } from '@/api/lessons';

export function useLesson(lessonId: number) {
    const [lesson, setLesson] = useState<Lesson>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await getLessonByID(lessonId);
                setLesson(response.data.lesson);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки уроков');
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) fetchLesson();
    }, [lessonId]);

    return { lesson, isLoading, error };
}