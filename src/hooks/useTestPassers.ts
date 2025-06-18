import { useState, useEffect, useCallback } from 'react';
import { getTestPassers } from '@/api/tests';
import type { TestPasser } from '@/api/types';

interface UseTestPassersResult {
  passers: TestPasser[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export default function useTestPassers(testId: number | null): UseTestPassersResult {
  const [passers, setPassers] = useState<TestPasser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPassers = useCallback(async () => {
    if (testId === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTestPassers(testId);
      setPassers(response.data.passers);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить результаты');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchPassers();
  }, [fetchPassers]);

  return {
    passers,
    isLoading,
    error,
    refetch: fetchPassers,
  };
}
