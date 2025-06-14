import useAccountUsers from '@/hooks/useAccountUsers';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOutletContext } from 'react-router-dom';
import { type Account, type Invite } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { InviteModal } from './InviteModal';
import useAccountInvites from '@/hooks/useAccountInvites';
import { removeInvite } from '@/api/invites';
import { ConfirmModal } from '@/components/ConfirmModal';

export function AccountMembersPage() {
    const { account } = useOutletContext<{ account: Account }>();
    const { members, isLoading, error } = useAccountUsers(account.id);
    const { user } = useAuth();
    const { 
        invites, 
        isLoading: invitesLoading, 
        error: invitesError, 
        refresh: refreshInvites 
    } = useAccountInvites(account.id);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);

    const handleRevokeClick = (invite: Invite) => {
        setCurrentInvite(invite);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmRevoke = async () => {
        if (!currentInvite) return;
        
        try {
            await removeInvite({
                id: currentInvite.id
            });
            refreshInvites();
        } catch (error) {
            console.error('Ошибка при отзыве приглашения:', error);
        } finally {
            setIsConfirmModalOpen(false);
            setCurrentInvite(null);
        }
    };
    

    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Блок участников */}
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
                                <h3 className="font-medium text-gray-100">
                                    {member.user.name} 
                                    {user?.id === member.user.id && (<span className="text-sm text-cgray-200 ml-2">(вы)</span>)}
                                </h3>
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


            {/* Блок приглашений */}
            <div className="space-y-3">
                <div className="flex">
                    <Button variant="ghost" onClick={() => setIsInviteModalOpen(true)}>
                        Пригласить
                    </Button>
                </div>
                
                <hr className="border-cgray-600" />

                {invitesError ? <div className="text-red-400">{invitesError}</div> : invitesLoading ? (
                    <Skeleton count={2} className="h-12 rounded-lg" />
                ) : invites.length > 0 ? (
                    [...invites].reverse().map((invite) => (
                        <div 
                            key={invite.id}
                            className="flex items-center p-4 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-cgray-200">{invite.email}</p>
                            </div>
                            <Button variant="light" size="sm" onClick={() => handleRevokeClick(invite)}>
                                Отозвать
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center py-6">Нет активных приглашений</div>
                )}

                <InviteModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    accountId={account.id}
                    onSuccess={refreshInvites}
                />

                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    message={`Вы действительно хотите отозвать приглашение для ${currentInvite?.email}?`}
                    onConfirm={handleConfirmRevoke}
                    onCancel={() => setIsConfirmModalOpen(false)}
                />
            </div>
        </div>
    );
}