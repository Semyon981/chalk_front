import { useEffect, useState } from 'react';
import { getCourseParticipants } from '@/api/courses';
import { type AccountMember } from '@/api/types';

export function useCourseParticipants(accountId?: number) {
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!accountId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getCourseParticipants(accountId);
      setMembers(response.data.participants);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [accountId]);

  return { 
    members, 
    isLoading, 
    error, 
    refetch: fetchMembers 
  };
}