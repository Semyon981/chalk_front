import { useParams } from 'react-router-dom';
import useTestPassers from '@/hooks/useTestPassers';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

export default function TestPassersPage() {
    const { testID } = useParams<{ testID: string }>();
    const id = testID ? parseInt(testID, 10) : null;
    const { passers, isLoading, error, refetch } = useTestPassers(id);

    if (isLoading) {
        return <Skeleton count={5} className="h-12 mb-2 rounded-lg" />;
    }

    if (error) {
        return (
            <div className="text-red-400 text-center py-6">
                {error}
                <button
                    onClick={refetch}
                    className="mt-4 px-4 py-2 bg-cgray-700 rounded hover:bg-cgray-600"
                >
                    Повторить загрузку
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 px-25">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Прошедшие тест пользователи</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-cgray-800 rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-cgray-700 text-left">
                            <th className="px-4 py-2">Имя</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Попытки</th>
                        </tr>
                    </thead>
                    <tbody>
                        {passers.map(passer => (
                            <motion.tr
                                key={passer.user_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="border-b border-cgray-700 hover:bg-cgray-700"
                            >
                                <td className="px-4 py-2">{passer.name}</td>
                                <td className="px-4 py-2">{passer.email}</td>
                                <td className="px-4 py-2">{passer.attempts_count}</td>
                            </motion.tr>
                        ))}
                        {passers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-6 text-center text-cgray-400">
                                    Нет пользователей, прошедших тест.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}