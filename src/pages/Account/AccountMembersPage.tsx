
import useAccountUsers from '@/hooks/useAccountUsers';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOutletContext } from 'react-router-dom';
import { type Account } from '@/api/types';

export function AccountMembersPage() {
    const { account } = useOutletContext<{ account: Account }>();
    const { members, isLoading, error } = useAccountUsers(account.id);

    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div className="space-y-3">
            {isLoading ? (
                <Skeleton count={3} className="h-16 rounded-lg" />
            ) : members.length > 0 ? (
                members.map((member) => (
                    <div
                        key={member.user.id}
                        className="flex items-center p-4 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors"
                    >
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-100">{member.user.name}</h3>
                            <p className="text-sm text-cgray-200 mt-1">{member.user.email}</p>
                        </div>
                        <span className="text-sm bg-cgray-900 px-3 py-1 rounded-full text-cgray-200">
                            {member.role}
                        </span>
                    </div>
                ))
            ) : (
                <div className="text-gray-400 text-center py-6">Нет пользователей</div>
            )}
        </div>
    );
}