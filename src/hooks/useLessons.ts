import { useEffect, useState } from 'react';
import type { Lesson } from '@/api/types';
import { getLessonsByModuleID } from '@/api/modules';

export function useLessons(moduleId: number) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     const refetch = async () => {
           try {
                const response = await getLessonsByModuleID(moduleId);
                setError(null)
                setLessons(response.data.lessons);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки уроков');
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        if (moduleId) refetch();
    }, [moduleId]);

    return { lessons, isLoading, error,refetch };
}