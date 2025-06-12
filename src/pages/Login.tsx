import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/api/auth';
import { getUserByID } from '@/api/users';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await signIn({ email, password });
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('refresh_token', res.data.refresh_token);

            const userRes = await getUserByID('me');
            setUser(userRes.data.user);
            navigate('/');
        } catch (err) {
            setError('Неверные учетные данные');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl"
            >
                <h2 className="text-3xl font-bold mb-8 text-center text-white">Вход</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4 text-white">
                    <div>
                        <input
                            placeholder="Введите email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                [
                                    setEmail(e.target.value),
                                    setError('')
                                ]
                            }}
                            className="w-full px-4 py-3 bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <input
                            placeholder="Введите пароль"
                            type="password"
                            value={password}
                            onChange={(e) => [
                                setPassword(e.target.value),
                                setError('')
                            ]}
                            className="w-full px-4 py-3 bg-gray-700/30 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <Button type="submit" variant="light" className="w-full mt-6">
                        Войти
                    </Button>
                </div>

                <p className="mt-6 text-center text-gray-300">
                    Нет аккаунта?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-white hover:underline font-medium"
                    >
                        Создать аккаунт
                    </button>
                </p>
            </form>
        </div>
    );
}