import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { createAccount, checkAccountName } from '@/api/accounts';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from 'lodash';

export default function CreateAccountPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const debouncedCheckName = useRef(
        debounce(async (name: string) => {
            if (!name.trim()) {
                setNameAvailable(null);
                setIsChecking(false);
                return;
            }

            try {
                const response = await checkAccountName(name);
                setNameAvailable(!response.data.assigned);
            } catch (err) {
                setError('Ошибка проверки имени');
                console.error(err);
            } finally {
                setIsChecking(false);
            }
        }, 500)
    );

    useEffect(() => {
        return () => {
            debouncedCheckName.current.cancel();
        };
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        setError('');
        setNameAvailable(null);

        if (newName.trim()) {
            setIsChecking(true);
            debouncedCheckName.current(newName);
        } else {
            setNameAvailable(null);
            setIsChecking(false);
            debouncedCheckName.current.cancel();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Введите название аккаунта');
            return;
        }

        if (nameAvailable === false) {
            setError('Это имя аккаунта уже занято');
            return;
        }

        try {
            setIsLoading(true);
            const response = await createAccount({ name });
            navigate(`/accounts/${response.data.account.name}`);
        } catch (err) {
            setError('Не удалось создать аккаунт');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Создать новый аккаунт</h2>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    </motion.div>
                )}

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2 min-h-6">
                            <label className="text-sm font-medium text-white">
                                Название аккаунта
                            </label>
                            <div className="flex items-center">
                                <AnimatePresence>
                                    {isChecking && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-xs text-gray-400"
                                        >
                                            Проверка...
                                        </motion.span>
                                    )}
                                    {!isChecking && nameAvailable !== null && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className={`ml-2 text-xs ${nameAvailable ? 'text-green-400' : 'text-red-400'}`}
                                        >
                                            {nameAvailable ? 'Доступно' : 'Занято'}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className="w-full px-4 py-3 text-white bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Введите уникальное имя"
                            disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Имя должно быть уникальным и содержать только буквы, цифры и дефисы
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="light"
                            className="w-full"
                            disabled={isLoading || isChecking}
                        >
                            {isLoading ? 'Создание...' : 'Создать аккаунт'}
                        </Button>
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-400">
                    <p>Будучи создателем, вы получите права администратора</p>
                    {
                        <p className="mt-2 text-sm">
                            Создатель: <span className="text-blue-400">{user && user.name}</span>
                        </p>
                    }
                </div>

                <div className="mt-6 border-t border-gray-700 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate(-1)}
                    >
                        Назад
                    </Button>
                </div>
            </form>
        </div>
    );
}