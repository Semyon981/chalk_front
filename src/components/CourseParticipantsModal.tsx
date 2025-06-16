import { useEffect, useState } from 'react';
import { unenrollUser, enrollUser, getCourseParticipants } from '@/api/courses';
import { type AccountMember } from '@/api/types';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { Avatar } from './Avatar';

interface CourseParticipantsModalProps {
    isOpen: boolean;
    courseId: number;
    members: AccountMember[];
    onClose: () => void;
}

export function CourseParticipantsModal({ isOpen, courseId, members, onClose }: CourseParticipantsModalProps) {
    const [enrolled, setEnrolled] = useState<AccountMember[]>([]);
    const [available, setAvailable] = useState<AccountMember[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen || !courseId) return;
        getCourseParticipants(courseId).then(resp => {
            const users = resp.data.participants;
            setEnrolled(users);
            setAvailable(
                members.filter(m => !users.some(u => u.user.id === m.user.id))
            );
        });
    }, [isOpen, courseId]);

    const handleUnenroll = async (userId: number) => {
        await unenrollUser({ id: courseId, user_id: userId });
        const removed = enrolled.find(m => m.user.id === userId);
        if (!removed) return;
        setEnrolled(prev => prev.filter(m => m.user.id !== userId));
        setAvailable(prev => [...prev, removed]);
    };

    const handleEnroll = async () => {
        if (selectedUser === null) return;
        await enrollUser({ id: courseId, user_id: selectedUser });
        const added = available.find(m => m.user.id === selectedUser);
        if (!added) return;
        setAvailable(prev => prev.filter(m => m.user.id !== selectedUser));
        setEnrolled(prev => [...prev, added]);
        setSelectedUser(null);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Список участников курса">
            <div className="mb-4">
                <select
                    className="w-full bg-gray-700 border border-gray-600 text-white p-2 rounded-md outline-none"
                    value={selectedUser ?? ''}
                    onChange={e => setSelectedUser(Number(e.target.value))}
                >
                    <option value="" disabled className="text-gray-400">Выберите пользователя</option>
                    {available.map(u => (
                        <option 
                            key={u.user.id} 
                            value={u.user.id}
                            className="bg-gray-800 text-white"
                        >
                            {members.find(m => m.user.id === u.user.id)!.user.name} ({members.find(m => m.user.id === u.user.id)!.user.email})
                        </option>
                    ))}
                </select>
                <Button 
                    variant="light" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={handleEnroll}
                    disabled={!selectedUser}
                >
                    Записать на курс
                </Button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {enrolled.map(u => {
                    const member = members.find(m => m.user.id === u.user.id)!;
                    return (
                        <div 
                            key={u.user.id} 
                            className="flex justify-between items-center p-3 bg-gray-700 rounded-lg transition-colors hover:bg-gray-600"
                        >
                            <div className='flex gap-3 items-center'>
                                <Avatar name={member.user.name} size="sm" />
                                <div className="text-gray-200 flex flex-col">
                                    <span className="font-medium">{member.user.name}</span>
                                    <span className="text-gray-400 text-sm">{member.user.email}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleUnenroll(u.user.id)} 
                                className="text-red-400 hover:text-red-300 p-1 transition-colors"
                                aria-label="Удалить участника"
                            >
                                <TrashIcon size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </Dialog>
    );
}