import { useState, useEffect, useCallback } from 'react';
import { getTestInfo, createTestQuestion, updateTestQuestion, removeTestQuestion,
         createTestAnswer, updateTestAnswer, removeTestAnswer } from '@/api/tests';
import type { Test, TestQuestion, TestQuestionAnswer } from '@/api/types';

export function useTest(testId: number) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getTestInfo(testId);
      setTest(resp.data.test);
    } catch (err: any) {
      setError(err.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Question handlers
  const addQuestion = async () => {
    if (!test) return;
    const resp = await createTestQuestion({ test_id: testId, question: 'Новый вопрос' });
    await fetch();
    return resp.data.id;
  };

  const updateQuestion = async (id: number, question: string) => {
    await updateTestQuestion({ id, question });
    await fetch();
  };

  const removeQuestion = async (id: number) => {
    await removeTestQuestion(id);
    await fetch();
  };

  // Answer handlers
  const addAnswer = async (questionId: number) => {
    if (!test) return;
    const resp = await createTestAnswer({ question_id: questionId, answer: 'Новый ответ', is_correct: false });
    await fetch();
    return resp.data.id;
  };

  const updateAnswer = async (id: number, updates: { answer?: string; is_correct?: boolean }) => {
    await updateTestAnswer({ id, ...updates });
    await fetch();
  };

  const removeAnswer = async (id: number) => {
    await removeTestAnswer(id);
    await fetch();
  };

  return {
    test,
    loading,
    error,
    refetch: fetch,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addAnswer,
    updateAnswer,
    removeAnswer,
  };
}