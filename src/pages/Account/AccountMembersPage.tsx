import { Skeleton } from '@/components/ui/Skeleton';
import { useOutletContext } from 'react-router-dom';
import { type Account, type AccountMember, type Invite, type User } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useEffect, useState, useRef } from 'react';
import { InviteModal } from './InviteModal';
import useAccountInvites from '@/hooks/useAccountInvites';
import { removeInvite } from '@/api/invites';
import { ConfirmModal } from '@/components/ConfirmModal';
import { getUserRoleInAccount } from '@/lib/utils';
import { removeAccountMember, updateAccountMember } from '@/api/accounts';
import { BookOpenTextIcon, EditIcon, TrashIcon, Trash, UserRoundMinus, Minus, X } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { ParticipantCoursesModal } from '@/components/ParticipantCoursesModal';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export function AccountMembersPage() {
    dayjs.locale('ru');
    const { account, members, refetchMembers } = useOutletContext<{ account: Account; members: AccountMember[]; refetchMembers: () => void }>();
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
    }>({ isOpen: false, message: '', onConfirm: () => { } });

    const [userRole, setUserRole] = useState<string | null>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const optionsRef = useRef<HTMLDivElement>(null);

    const [isParticipantCoursesModalOpen, setIsParticipantCoursesModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<User>({ id: 0, name: '', email: '' });

    useEffect(() => {
        if (user && members) {
            setUserRole(getUserRoleInAccount(user.id, members));
            setIsCheckingRole(false);
        }
    }, [user, members]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setOpenOptionsId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMemberClick = (memberId: number) => {
        if ((userRole === 'owner' || userRole === 'admin') && memberId !== user?.id) {
            setOpenOptionsId(openOptionsId === memberId ? null : memberId);
        }
    };

    const handleRemoveMember = (memberId: number) => {
        setConfirmConfig({
            isOpen: true,
            message: 'Вы действительно хотите удалить пользователя из аккаунта?',
            onConfirm: async () => {
                await removeAccountMember({ account_id: account.id, user_id: memberId });
                refetchMembers();
                setOpenOptionsId(null);
            },
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
                await updateAccountMember({ account_id: account.id, user_id: memberId, role: newRole as any });
                refetchMembers();
                setEditingRoleId(null);
            },
        });
    };

    const handleRevokeInviteClick = (invite: Invite) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите отозвать приглашение для ${invite.email}?`,
            onConfirm: async () => {
                await removeInvite({ id: invite.id });
                refreshInvites();
            },
        });
    };

    const handleInitiateMemberCourses = (member: User) => {
        setSelectedParticipant(member);
        setIsParticipantCoursesModalOpen(true);
    };

    return (
        <div className="grid grid-cols-2 gap-8 px-25">
            {/* Left Column: Members */}
            <div className="space-y-6">
                <h2 className="text-lg font-semibold h-[20px]">Пользователи</h2>
                <div className="space-y-2">
                    {isCheckingRole ? (
                        <Skeleton count={3} className="h-16 rounded-lg" />
                    ) : members.length > 0 ? (
                        [...members].reverse().map(member => (
                            <div
                                key={member.user.id}
                                className={`group relative flex items-center p-4 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors ${(userRole === 'owner' || userRole === 'admin') && member.user.id !== user?.id
                                    ? 'cursor-pointer'
                                    : ''
                                    }`}
                                onClick={() => handleMemberClick(member.user.id)}
                            >
                                <div className="flex flex-1 items-center gap-5">
                                    <Avatar name={member.user.name} size="md" />
                                    <div className="flex flex-col">
                                        <h3 className="font-medium text-gray-100">
                                            {member.user.name}
                                            {user?.id === member.user.id && <span className="text-sm text-cgray-200 ml-1">(вы)</span>}
                                        </h3>
                                        <p className="text-sm text-cgray-200 mt-1">{member.user.email}</p>
                                    </div>
                                </div>

                                {editingRoleId === member.user.id ? (
                                    <div className="flex items-center space-x-2">
                                        <select
                                            className="bg-cgray-900 text-cgray-200 px-3 py-1 rounded-lg"
                                            value={newRole}
                                            onChange={e => setNewRole(e.target.value)}
                                        >
                                            {['owner', 'admin', 'member'].map(opt => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                        <Button variant="light" onClick={() => handleRoleSelect(member.user.id)}>
                                            Подтвердить
                                        </Button>
                                        <Button variant="ghost" onClick={() => setEditingRoleId(null)}>
                                            Отмена
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-sm bg-cgray-900 px-3 py-1 rounded-full text-cgray-200">{member.role}</span>
                                        {openOptionsId === member.user.id && (
                                            <div ref={optionsRef} className="absolute right-0 top-20 bg-cgray-800 border border-cgray-600 p-4 rounded-lg space-y-2 z-50">
                                                {(userRole === 'owner' || userRole === 'admin') && (
                                                    <button
                                                        className="flex items-center text-left w-full text-sm text-white hover:bg-cgray-600 p-2 rounded"
                                                        onClick={() => handleInitiateMemberCourses(member.user)}
                                                    >
                                                        <BookOpenTextIcon className="mr-2" /> Курсы пользователя
                                                    </button>
                                                )}
                                                {userRole === 'owner' && (
                                                    <button
                                                        className="flex items-center text-left w-full text-sm text-white hover:bg-cgray-600 p-2 rounded"
                                                        onClick={() => handleInitiateRoleChange(member.user.id, member.role)}
                                                    >
                                                        <EditIcon className="mr-2" /> Изменить роль
                                                    </button>
                                                )}
                                                {userRole === 'owner' && (
                                                    <button
                                                        className="flex items-center text-left w-full text-sm text-red-500 hover:bg-cgray-600 p-2 rounded"
                                                        onClick={() => handleRemoveMember(member.user.id)}
                                                    >
                                                        <UserRoundMinus className="mr-2" /> Удалить из аккаунта
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {((userRole === 'owner' && member.role !== 'owner') ||
                                    (userRole === 'admin' && member.role === 'member')) && (
                                        <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleRemoveMember(member.user.id)}
                                                className="text-red-500 cursor-pointer hover:text-red-400 p-1"
                                            >
                                                <UserRoundMinus size={20} />
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-center py-6">Нет пользователей</div>
                    )}
                </div>
            </div>

            {/* Right Column: Invites */}

            <div className="space-y-6">
                <div className="flex items-center justify-between h-[20px]">
                    <h2 className="text-lg font-semibold">Приглашения</h2>
                    {userRole !== 'member' && (
                        <Button variant="ghost" onClick={() => setIsInviteModalOpen(true)}>
                            Пригласить
                        </Button>
                    )}
                </div>
                <div className="space-y-2">
                    {invitesError ? (
                        <div className="text-red-400">{invitesError}</div>
                    ) : invitesLoading ? (
                        <Skeleton count={2} className="h-12 rounded-lg" />
                    ) : invites.length > 0 ? (
                        [...invites].reverse().map(invite => (
                            <div
                                key={invite.id}
                                className="group relative flex items-center pl-3 pt-2 pb-2 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-cgray-100">{invite.email}</p>
                                        <p className="text-cgray-300 pr-2 text-sm whitespace-nowrap">
                                            {dayjs(invite.created).format('D MMMM YYYY, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                {userRole !== 'member' && (
                                    <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleRevokeInviteClick(invite)}
                                            className="text-red-500 cursor-pointer hover:text-red-400 p-1"
                                        >
                                            <X size={23} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-cgray-200 text-center py-6">Нет активных приглашений</div>
                    )}
                </div>

                <InviteModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    accountId={account.id}
                    onSuccess={refreshInvites}
                />
            </div>


            {/* Modals */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                message={confirmConfig.message}
                onConfirm={async () => {
                    await confirmConfig.onConfirm();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                }}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />

            <ParticipantCoursesModal
                isOpen={isParticipantCoursesModalOpen}
                onClose={() => setIsParticipantCoursesModalOpen(false)}
                accountId={account.id}
                userId={selectedParticipant.id}
                userName={selectedParticipant.name}
            />
        </div>
    );
}
