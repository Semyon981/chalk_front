
import { useForm } from 'react-hook-form';
import { createCourse } from '@/api/courses';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    accountId: number;
    onClose: () => void;
    onSuccess: () => void;
}

type FormData = {
    name: string;
};

export function CreateCourseModal({ isOpen, accountId, onClose, onSuccess }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
    const [error, setError] = useState('');

    const onSubmit = async (data: FormData) => {
        try {
            await createCourse({
                account_id: accountId,
                name: data.name.trim()
            });
            onSuccess();
            reset();
            onClose();
        } catch (err) {
            setError('Произошла ошибка при создании');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-cgray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Создать новый курс</h2>
                    <button
                        onClick={onClose}
                        className="text-cgray-100 text-2xl hover:text-cgray-200"
                    >

                        ×

                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Название курса
                        </label>
                        <input
                            id="name"
                            {...register('name', {
                                required: 'Обязательное поле',
                                minLength: {
                                    value: 3,
                                    message: 'Минимум 3 символа'
                                }
                            })}
                            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
                            variant='light'
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Создание...' : 'Создать'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}