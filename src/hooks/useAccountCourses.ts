import { useEffect, useState } from 'react';
import { getAccountCourses } from '@/api/accounts';
import type { Course } from '@/api/types';

export default function useAccountCourses(accountId?: number) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    const loadCourses = async () => {
      try {
        const response = await getAccountCourses(accountId);
        setCourses(response.data.courses);
      } catch (err) {
        setError('Ошибка загрузки курсов');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [accountId]);

  return { courses, isLoading, error };
}