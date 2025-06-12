import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { sendCode, signUp, checkEmail } from '@/api/auth';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [codeId, setCodeId] = useState('');
    const navigate = useNavigate();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const check = await checkEmail(email);
            if (check.data.assigned) {
                setError('Email уже занят');
                return
            }

            const res = await sendCode({ email });
            setCodeId(res.data.code_id);
            setStep(2);
            setError('');
        } catch (err) {
            setError('Ошибка отправки кода. Проверьте email.');
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signUp({ code_id: codeId, code, name, password });
            navigate('/login');
        } catch (err) {
            setError('Ошибка регистрации. Проверьте данные.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
            <form
                onSubmit={step === 1 ? handleSendCode : handleSignUp}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl"
            >
                <h2 className="text-3xl font-bold mb-8 text-center text-white">
                    {step === 1 ? 'Регистрация' : 'Завершение регистрации'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-4 text-white">
                        <div>
                            <input
                                placeholder='Введите email'
                                type="email"
                                value={email}
                                onChange={(e) => [setEmail(e.target.value), setError('')]}
                                className="w-full px-4 py-3 bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <Button type="submit" variant="light" className="w-full mt-6">
                            Получить код
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 text-white">
                        <div>
                            <input
                                placeholder='Код из письма'
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <input
                                placeholder='Имя'
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <input
                                placeholder='Пароль'
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <Button type="submit" variant="light" className="w-full mt-6">
                            Зарегистрироваться
                        </Button>
                    </div>
                )}

                <p className="mt-6 text-center text-gray-300">
                    Уже есть аккаунт?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-white hover:underline font-medium"
                    >
                        Войти
                    </button>
                </p>
            </form>
        </div>
    );
}