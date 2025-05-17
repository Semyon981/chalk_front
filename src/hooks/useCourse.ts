import { useEffect, useState } from 'react';
import type { Course } from '@/api/types';
import { getCourseByID } from '@/api/courses';

export function useCourse(courseId: number) {
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await getCourseByID(courseId);
                setCourse(response.data.course);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки курса');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) fetchCourse();
    }, [courseId]);

    return { course, isLoading, error };
}