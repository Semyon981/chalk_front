// src/pages/Account/AccountCoursesPage.tsx
import { useAccountCourses } from '@/hooks/useAccountCourses';
import { Skeleton } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { type Account, type AccountMember } from '@/api/types';
import { useEffect, useState } from 'react';
import { CreateCourseModal } from '@/pages/Account/CreateCourseModal';
import { getUserRoleInAccount } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { EllipsisIcon } from 'lucide-react';
import { CourseParticipantsModal } from '@/components/CourseParticipantsModal';

export function AccountCoursesPage() {
    const { account, members } = useOutletContext<{ account: Account, members: AccountMember[] }>();
    const { user } = useAuth();
    const { courses, isLoading, error, refreshCourses } = useAccountCourses(account.id);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const navigate = useNavigate();

    const userRole = getUserRoleInAccount(user!.id, members);

    useEffect(() => {
        if (userRole === 'member') navigate('/account');
    }, [userRole]);

    if (error) return <div className="text-red-400">{error}</div>;

    const openParticipants = (courseId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCourseId(courseId);
        setIsParticipantsModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-25">
                {isLoading ? (
                    <Skeleton count={3} className="h-32 rounded-xl" />
                ) : (
                    <>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="p-4 h-30 border-2 border-dashed cursor-pointer border-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                        >
                            <span className="text-white text-4xl">+</span>
                        </button>

                        {courses.map((course) => (
                            <div key={course.id} className="relative group">
                                <Link
                                    to={`/accounts/${account.name}/courses/${course.id}`}
                                    className="p-4 h-30 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors block"
                                >
                                    <h3 className="text-lg font-medium text-gray-100 overflow-hidden text-ellipsis">
                                        {course.name}
                                    </h3>
                                </Link>
                                <button
                                    onClick={(e) => openParticipants(course.id, e)}
                                    className="absolute top-2 right-2 p-1 bg-cgray-700 rounded hover:bg-cgray-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                    aria-label="Управление участниками курса"
                                >
                                    <EllipsisIcon size={20} className="text-gray-300" />
                                </button>
                            </div>
                        ))}

                        {courses.length === 0 && (
                            <div className="text-cgray-200 col-span-full text-center py-6">
                                Нет курсов
                            </div>
                        )}

                        <CreateCourseModal
                            isOpen={isCreateModalOpen}
                            accountId={account.id}
                            onClose={() => setIsCreateModalOpen(false)}
                            onSuccess={refreshCourses}
                        />
                    </>
                )}
            </div>

            <CourseParticipantsModal
                isOpen={isParticipantsModalOpen}
                courseId={selectedCourseId}
                members={members}
                onClose={() => setIsParticipantsModalOpen(false)}
            />
        </>
    );
}