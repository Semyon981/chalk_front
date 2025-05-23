import { useEffect, useState } from 'react';
import type { Module } from '@/api/types';
import { getModulesByCourseID } from '@/api/courses';

export function useModules(courseId: number) {
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            const response = await getModulesByCourseID(courseId);
            setModules(response.data.modules);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка загрузки модулей');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) refetch();
    }, [courseId]);

    return { modules, isLoading, error, refetch };
}