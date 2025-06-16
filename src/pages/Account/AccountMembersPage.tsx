import { Skeleton } from '@/components/ui/Skeleton';
import { useOutletContext } from 'react-router-dom';
import { type Account, type AccountMember, type Invite } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useEffect, useState, useRef } from 'react';
import { InviteModal } from './InviteModal';
import useAccountInvites from '@/hooks/useAccountInvites';
import { removeInvite } from '@/api/invites';
import { ConfirmModal } from '@/components/ConfirmModal';
import { getUserRoleInAccount } from '@/lib/utils';
import { removeAccountMember, updateAccountMember } from '@/api/accounts';
import { EditIcon, TrashIcon } from 'lucide-react';
import { Avatar } from '@/components/Avatar';

export function AccountMembersPage() {
    const { account, members, refetchMembers } = useOutletContext<{ account: Account, members: AccountMember[], refetchMembers: () => void }>();
    const { user } = useAuth();
    const {
        invites,
        isLoading: invitesLoading,
        error: invitesError,
        refresh: refreshInvites,
    } = useAccountInvites(account.id);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, message: '', onConfirm: () => {} });

    const [userRole, setUserRole] = useState<string | null>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    // Состояние UI для действий с участниками
    const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const optionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && account && members) {
            const role = getUserRoleInAccount(user.id, members);
            setUserRole(role);
            setIsCheckingRole(false);
        }
    }, [user, account, members]);

    // Закрытие меню опций при клике вне
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setOpenOptionsId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [optionsRef]);

    const handleMemberClick = (memberId: number) => {
        if (userRole === 'owner' || userRole === 'admin') {
            const member = members.find(m => m.user.id === memberId);
            if (!member) return;
            if (member.role === 'owner' || (userRole === 'admin' && member.role === 'admin')) return; // админ не может действовать над владельцем и админом
            if (member.user.id === user?.id) return; // нельзя действовать над собой
            setOpenOptionsId(openOptionsId === memberId ? null : memberId);
        }
    };

    const handleRemoveMember = (memberId: number) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите удалить пользователя из аккаунта?`,
            onConfirm: async () => {
                await removeAccountMember({ account_id: account.id, user_id: memberId });
                refetchMembers();
                setOpenOptionsId(null);
            }
        });
    };

    const handleInitiateRoleChange = (memberId: number, currentRole: string) => {
        setEditingRoleId(memberId);
        setNewRole(currentRole);
        setOpenOptionsId(null);
    };

    const handleRoleSelect = (memberId: number) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите изменить роль пользователя на ${newRole}?`,
            onConfirm: async () => {
                await updateAccountMember({ account_id: account.id, user_id: memberId, role: newRole as 'owner' | 'admin' | 'member' });
                refetchMembers();
                setEditingRoleId(null);
            }
        });
    };

    // Отозвать приглашение
    const handleRevokeInviteClick = (invite: Invite) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите отозвать приглашение для ${invite.email}?`,
            onConfirm: async () => {
                await removeInvite({ id: invite.id });
                refreshInvites();
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Секция участников */}
            <div className="space-y-3">
                {isCheckingRole ? (
                    <Skeleton count={3} className="h-16 rounded-lg" />
                ) : members.length > 0 ? (
                    [...members].reverse().map(member => (
                        <div
                            key={member.user.id}
                            className={`relative flex items-center p-4 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors ${
                                (userRole === 'owner' || userRole === 'admin') && member.role !== 'owner' && member.user.id !== user?.id
                                || (userRole === 'admin' && member.role !== 'admin')
                                ? 'cursor-pointer'
                                : ''
                            }`}
                            onClick={() => handleMemberClick(member.user.id)}
                        >
                            <div className='flex flex-1 items-center gap-5'>
                                <Avatar name={member.user.name} size="md" />
                                <div className="flex flex-col">
                                    <h3 className="font-medium text-gray-100">
                                        {member.user.name}
                                        {user?.id === member.user.id && (
                                            <span className="text-sm text-cgray-200 ml-2">(вы)</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-cgray-200 mt-1">{member.user.email}</p>
                                </div>
                            </div>

                            {/* Отображение роли или редактор */}
                            {editingRoleId === member.user.id ? (
                                <div className="flex items-center space-x-2">
                                    <select
                                        className="bg-cgray-900 text-cgray-200 px-3 py-1 rounded-lg"
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                    >
                                        {['owner', 'admin', 'member'].map(roleOption => (
                                            <option key={roleOption} value={roleOption}>{roleOption}</option>
                                        ))}
                                    </select>
                                    <Button variant="light" size="sm" onClick={() => handleRoleSelect(member.user.id)}>
                                        Подтвердить
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingRoleId(null)}>
                                        Отмена
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm bg-cgray-900 px-3 py-1 rounded-full text-cgray-200">
                                        {member.role}
                                    </span>
                                    {/* Меню опций */}
                                    {openOptionsId === member.user.id && (
                                        <div ref={optionsRef} className="absolute right-0 top-20 bg-cgray-800 border border-cgray-600 p-4 rounded-lg space-y-2 z-50">
                                            {userRole === 'owner' && (
                                                <button
                                                    className="flex items-center text-left w-full text-sm text-white cursor-pointer hover:bg-cgray-600 p-2 rounded"
                                                    onClick={() => handleInitiateRoleChange(member.user.id, member.role)}
                                                >
                                                    <EditIcon className="mr-2" /> Изменить роль
                                                </button>
                                            )}
                                            <button
                                                className="flex items-center text-left w-full text-sm text-red-500 cursor-pointer hover:bg-cgray-600 p-2 rounded"
                                                onClick={() => handleRemoveMember(member.user.id)}
                                            >
                                                <TrashIcon className="mr-2" /> Удалить из аккаунта
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center py-6">Нет пользователей</div>
                )}
            </div>

            {/* Секция приглашений */}
            {userRole !== 'member' && (
                <div className="space-y-3">
                    <div className="flex">
                        <Button variant="ghost" onClick={() => setIsInviteModalOpen(true)}>
                            Пригласить
                        </Button>
                    </div>
                    <hr className="border-cgray-600" />

                    {invitesError ? (
                        <div className="text-red-400">{invitesError}</div>
                    ) : invitesLoading ? (
                        <Skeleton count={2} className="h-12 rounded-lg" />
                    ) : invites.length > 0 ? (
                        [...invites].reverse().map(invite => (
                            <div
                                key={invite.id}
                                className="flex items-center p-4 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="text-cgray-200">{invite.email}</p>
                                </div>
                                <Button
                                    variant="light"
                                    size="sm"
                                    onClick={() => handleRevokeInviteClick(invite)}
                                >
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
                        isOpen={confirmConfig.isOpen}
                        message={confirmConfig.message}
                        onConfirm={async () => {
                            await confirmConfig.onConfirm();
                            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                        }}
                        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                    />
                </div>
            )}
        </div>
    );
}