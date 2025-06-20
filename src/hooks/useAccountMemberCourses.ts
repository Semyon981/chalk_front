import { useEffect, useState } from 'react';
import { getMemberCourses } from '@/api/accounts';
import type { Course } from '@/api/types';

export default function useAccountMemberCourses(
  accountId?: number,
  memberId?: number
) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId || !memberId) return;

    const loadCourses = async () => {
      try {
        const response = await getMemberCourses(accountId, memberId);
        setError(null)
        setCourses(response.data.courses);
      } catch (err) {
        setError('Ошибка загрузки курсов');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [accountId, memberId]);

  return { courses, isLoading, error };
}