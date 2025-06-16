import { useEffect, useState } from 'react';
import { getAccountMembers } from '@/api/accounts';
import type { AccountMember } from '@/api/types';

export default function useAccountUsers(accountId?: number) {
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!accountId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getAccountMembers(accountId);
      setMembers(response.data.members);
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