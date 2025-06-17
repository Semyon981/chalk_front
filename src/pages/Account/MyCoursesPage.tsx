import useAccountMemberCourses from '@/hooks/useAccountMemberCourses';
import { Skeleton } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { type Account } from '@/api/types';

export function MyCoursesPage() {
    const { account } = useOutletContext<{ account: Account }>();
    const { user } = useAuth();
    const { courses: myCourses, isLoading, error } = useAccountMemberCourses(account.id, user?.id);

    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading ? (
                <Skeleton count={3} className="h-32 rounded-xl" />
            ) : myCourses.length > 0 ? (
                myCourses.map((course) => (
                    <Link
                        key={course.id}
                        to={`/accounts/${account.name}/courses/${course.id}`}
                        className="p-4 h-30 bg-cgray-600/50 rounded-lg hover:bg-cgray-500/70 transition-colors"
                    >
                        <h3 className="text-lg font-medium text-gray-100 overflow-hidden text-ellipsis">{course.name}</h3>
                        {/* <p className="text-sm text-gray-400 mt-2">{course.description}</p> */}
                    </Link>
                ))

            ) : (
                <div className="text-gray-400 col-span-full text-center py-6">
                    Нет доступных курсов
                </div>
            )}
        </div>
    );
}