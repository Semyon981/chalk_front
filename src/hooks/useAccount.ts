import { useEffect, useState } from 'react';
import { getAccountByName } from '@/api/accounts';
import { type Account } from '@/api/types';

export default function useAccount(accountName?: string) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountName) {
      setIsLoading(false);
      return;
    }

    const fetchAccount = async () => {
      try {
        const response = await getAccountByName(accountName);
        setAccount(response.data.account);
      } catch (err) {
        setError('Аккаунт не найден или нет доступа');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [accountName]);

  return { account, isLoading, error };
}