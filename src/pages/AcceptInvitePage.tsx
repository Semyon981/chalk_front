import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { acceptInvite } from '@/api/invites';
import { Button } from '@/components/ui/Button';

export default function AcceptInvitePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const inviteKey = searchParams.get('key');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAcceptInvite = async () => {
        if (!inviteKey) return;
        
        setIsLoading(true);
        try {
            await acceptInvite({ key: inviteKey });
            navigate('/'); // или куда нужно после принятия
        } catch (err) {
            setError('Не удалось принять приглашение. Возможно, ссылка недействительна.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!inviteKey) {
            navigate('/');
        }
    }, [inviteKey, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
                <h2 className="text-3xl font-bold mb-6 text-white">Приглашение в аккаунт</h2>
                
                <p className="text-gray-300 mb-8">
                    Вы были приглашены в аккаунт. Пожалуйста, нажмите кнопку ниже, чтобы принять приглашение.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Button 
                    onClick={handleAcceptInvite}
                    disabled={isLoading}
                    variant="light"
                    className="w-full"
                >
                    {isLoading ? 'Принимаем...' : 'Принять приглашение'}
                </Button>

                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-white hover:underline font-medium text-sm mt-4"
                >
                    На главную
                </button>
            </div>
        </div>
    );
}