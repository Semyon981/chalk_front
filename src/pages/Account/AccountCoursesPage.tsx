import { useAccountCourses } from '@/hooks/useAccountCourses';
import { Skeleton } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { type Account, type AccountMember } from '@/api/types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CreateCourseModal } from '@/pages/Account/CreateCourseModal';
import { getUserRoleInAccount } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function AccountCoursesPage() {
    const { account, members } = useOutletContext<{ account: Account, members: AccountMember[] }>();
    const { user } = useAuth();
    const { courses, isLoading, error, refreshCourses } = useAccountCourses(account.id);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate()

    
    const userRole = getUserRoleInAccount(user!.id, members);

    useEffect(() => {
        if (userRole === 'member') navigate('/account');
    }, [userRole]);


    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading ? (
                <Skeleton count={3} className="h-32 rounded-xl" />
            ) : (
                <>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="p-4 h-30 border-2 border-dashed border-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                    >
                        <span className="text-white text-4xl">+</span>
                    </button>

                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            to={`/accounts/${account.name}/courses/${course.id}`}
                            className="p-4 h-30 bg-cgray-700 rounded-lg hover:bg-cgray-800 transition-colors"
                        >
                            <h3 className="text-lg font-medium text-gray-100">{course.name}</h3>
                        </Link>
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
    );
}
