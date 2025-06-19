import { type MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Course } from '@/api/types';

interface CoursesGridProps {
    courses?: Course[];
    isLoading?: boolean;
    error?: string;
    onClick?: (course: Course) => void;
    accountName: string;
}

export function CoursesGrid({
    courses = [],
    isLoading = false,
    error,
    onClick,
    accountName,
}: CoursesGridProps) {
    if (error) {
        return <div className="text-red-400">{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-25">
            {isLoading ? (
                <Skeleton count={3} className="h-32 rounded-xl" />
            ) : courses.length > 0 ? (
                courses.map((course: Course) => {
                    const courseContent = (
                        <div
                            className="p-4 h-30 bg-cgray-600/50 rounded-lg hover:bg-cgray-500/70 transition-colors cursor-pointer"
                            onClick={onClick ? () => onClick(course) : undefined}
                        >
                            <h3 className="text-lg font-medium text-gray-100 overflow-hidden text-ellipsis">
                                {course.name}
                            </h3>
                        </div>
                    );

                    return onClick ? (
                        <div key={course.id}>{courseContent}</div>
                    ) : (
                        <Link
                            key={course.id}
                            to={`/accounts/${accountName}/courses/${course.id}`}
                        >
                            {courseContent}
                        </Link>
                    );
                })
            ) : (
                <div className="text-cgray-200 col-span-full text-center py-6">
                    Нет курсов
                </div>
            )}
        </div>
    );
}