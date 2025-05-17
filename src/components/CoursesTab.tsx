import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Course } from '@/api/types';
import { Link } from 'react-router-dom';

interface CoursesTabProps {
    courses: Course[];
    isLoading: boolean;
    error: string | null;
    title?: string;
}

export const CoursesTab = ({ courses, isLoading, error, title = 'Доступные курсы' }: CoursesTabProps) => {
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // className="bg-gray-800/30 p-6 rounded-xl"
            className="p-6 rounded-xl"
        >
            {/* <h2 className="text-2xl font-bold mb-6">{title}</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {isLoading ? (
                    <Skeleton count={3} className="h-32 rounded-xl" />
                ) : courses.length > 0 ? (
                    courses.map((course) => (
                        <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className="p-4 h-30 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                            <h3 className="text-lg font-medium">{course.name}</h3>
                        </Link>
                        // <div
                        //     key={course.id}
                        //     className="group p-5 h-30 bg-gray-700/20 rounded-xl hover:bg-gray-700/40 transition-colors"
                        // >
                        //     <h3 className="font-medium truncate">{course.name}</h3>
                        //     {/* <div className="mt-3 text-sm text-gray-300 opacity-80 group-hover:opacity-100 transition-opacity">
                        //         <p>ID: {course.id}</p>
                        //         <p className="mt-1">Аккаунт: {course.account_id}</p>
                        //     </div> */}
                        // </div>
                    ))
                ) : (
                    <div className="text-gray-400 col-span-full text-center py-6">
                        Нет доступных курсов
                    </div>
                )}
            </div>
        </motion.div>
    );
};