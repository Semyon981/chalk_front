import { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/Button';
import { type Account, type AccountMember } from '@/api/types';
import { getAccountMembers } from '@/api/accounts';
import { ParticipantCoursesModal } from '@/components/ParticipantCoursesModal';
import { useAuth } from '@/context/AuthContext';

export function MemberPage() {
    const { account } = useOutletContext<{ account: Account }>();
    const { memberID } = useParams<{ memberID: string }>();
    const navigate = useNavigate();
    const [member, setMember] = useState<AccountMember | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchMember() {
            setLoading(true);
            try {
                const all = await getAccountMembers(account.id);
                const found = all.data.members.find(m => m.user.id === Number(memberID));
                setMember(found || null);
            } finally {
                setLoading(false);
            }
        }
        fetchMember();
    }, [account.id, memberID]);

    if (loading) {
        return <div>Загрузка...</div>;
    }
    if (!member) {
        return <div>Участник не найден</div>;
    }

    return (
        <div className="p-6 mx-auto space-y-6 px-25">
            <div
                key={member.user.id}
                className={`w-150 group relative flex items-center p-4 bg-cgray-700 rounded-4xl transition-colors'`}
            >
                <div className="flex flex-1 items-center gap-5">
                    <Avatar name={member.user.name} size="xl" />
                    <div className="flex flex-col">
                        <h3 className="font-medium text-gray-100">
                            {member.user.name}
                            {user?.id === member.user.id && <span className="text-2sm text-cgray-200 ml-1">(вы)</span>}
                        </h3>
                        <p className="text-2sm text-cgray-200 mt-1">{member.user.email}</p>
                    </div>
                </div>
                <span className="text-2sm bg-cgray-900 px-3 py-1 rounded-full text-cgray-200">{member.role}</span>
            </div>

        </div>
    );
}
