import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/Button';
import { type AccountMember } from '@/api/types'
import { ChevronLeft, GripVertical, X, Edit, Check, Trash, Pencil, ArrowLeft, Users, UserRoundPlus } from 'lucide-react';


interface UsersListModalProps {
    isOpen: boolean;
    availableMembers: AccountMember[];
    onClose: () => void;
    onClick: (userId: number) => void;
}

export function UsersListModal({
    isOpen,
    availableMembers,
    onClose,
    onClick,
}: UsersListModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-3 z-50">
            <div className="bg-cgray-800 rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-cgray-100">Выберите пользователей</h2>
                    <button
                        onClick={onClose}
                        className="text-cgray-100 text-4xl hover:text-cgray-200 cursor-pointer"
                        aria-label="Закрыть"
                    >
                        <X size={25} />
                    </button>
                </div>

                <ul className="max-h-80 overflow-auto space-y-3 mb-3">
                    {availableMembers.map(member => (
                        <li
                            onClick={() => onClick(member.user.id)}
                            key={member.user.id}
                            className="flex justify-between items-center p-2 bg-cgray-700 hover:bg-cgray-600 rounded-lg cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar name={member.user.name} size="sm" />
                                <span className="text-cgray-100">{member.user.name}</span>
                                {/* <span className="text-cgray-100">{member.user.email}</span> */}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Отмена
                    </Button>
                </div>
            </div>
        </div>
    );
}