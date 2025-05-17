import { useState, useEffect } from 'react';
import { getUserAccounts } from '@/api/users';
import { type Account } from '@/api/types';

export default function useAccounts(userId: number | null) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!userId) return;

        try {
            setIsLoading(true);
            const response = await getUserAccounts(userId);
            setAccounts(response.data.accounts);
            setError(null);
        } catch (err) {
            setError('Ошибка загрузки аккаунтов');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return {
        accounts,
        isLoading,
        error,
        refresh
    };
}