import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { sendInvite } from '@/api/invites';

interface Props {
  isOpen: boolean;
  accountId: number;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  email: string;
};

export function InviteModal({ isOpen, accountId, onClose, onSuccess }: Props) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm<FormData>();
  
  const [error, setError] = useState('');

  const onSubmit = async (data: FormData) => {
    try {
      await sendInvite({
        account_id: accountId,
        email: data.email.trim(),
        callback_url: import.meta.env.VITE_API_URL
      });
      onSuccess();
      reset();
      onClose();
    } catch (err) {
      setError('Не удалось отправить приглашение');
      console.error('Failed to send invite:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-cgray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Отправить приглашение</h2>
          <button
            onClick={onClose}
            className="text-cgray-100 text-2xl hover:text-cgray-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email пользователя
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Обязательное поле',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email'
                }
              })}
              className={`w-full p-2 border rounded ${
                errors.email ? 'border-red-500' : 'border-cgray-600'
              } bg-cgray-700 text-gray-100`}
              placeholder="Введите email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              variant="light"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}