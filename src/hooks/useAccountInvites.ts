import { useEffect, useState } from 'react';
import { getAllInvites } from '@/api/accounts';
import type { Invite } from '@/api/types';

export default function useAccountInvites(accountId?: number) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvites = async () => {
    if (!accountId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllInvites(accountId);
      setInvites(response.data.invites);
    } catch (err) {
      setError('Ошибка загрузки приглашений');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [accountId]);

  return { 
    invites, 
    isLoading, 
    error, 
    refresh: fetchInvites 
  };
}