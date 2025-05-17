import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AccountMember } from '@/api/types';

interface UsersTabProps {
    members: AccountMember[];
    isLoading: boolean;
    error: string | null;
}

export const UsersTab = ({ members, isLoading, error }: UsersTabProps) => {
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // className="bg-gray-800/30 p-6 rounded-xl"
            className="p-6 rounded-xl"
        >
            {/* <h2 className="text-2xl font-bold mb-6">Пользователи аккаунта</h2> */}
            <div className="space-y-3">
                {isLoading ? (
                    <Skeleton count={3} className="h-16 rounded-lg" />
                ) : members.length > 0 ? (
                    members.map((member) => (
                        <div
                            key={member.user.id}
                            className="flex items-center p-4 bg-gray-700/20 rounded-lg hover:bg-gray-700/40 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-medium">{member.user.name}</h3>
                                <p className="text-sm text-gray-300 mt-1">{member.user.email}</p>
                            </div>
                            <span className="text-sm bg-gray-700/40 px-3 py-1 rounded-full">
                                {member.role}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center py-6">Нет пользователей</div>
                )}
            </div>
        </motion.div>
    );
};