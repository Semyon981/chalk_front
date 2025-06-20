import { useEffect, useState } from 'react';
import { getAccountCourses } from '@/api/accounts';
import type { Course } from '@/api/types';

export function useAccountCourses(accountId: number) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCourses = async () => {
    try {
        const response = await getAccountCourses(accountId);
        setError(null)
        setCourses(response.data.courses);
    } catch (err) {
      setError('Не удалось загрузить курсы');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCourses();
  }, [accountId]);

  return { courses, isLoading, error, refreshCourses };
}