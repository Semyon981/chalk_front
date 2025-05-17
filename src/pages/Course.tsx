import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourse } from '@/hooks/useCourse';
import { useModules } from '@/hooks/useModules';
import { useLessons } from '@/hooks/useLessons';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/UserMenu';
import useAccounts from '@/hooks/useAccounts';
import { useNavigate } from 'react-router-dom';

import { type Module } from '@/api/types';

export default function CoursePage() {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const numericCourseId = parseInt(courseId || '0');

    // Данные курса
    const { course, isLoading: isLoadingCourse, error: courseError } = useCourse(numericCourseId);

    // Модули курса
    const { modules, isLoading: isLoadingModules, error: modulesError } = useModules(numericCourseId);

    // Аккаунты пользователя для меню
    const { accounts } = useAccounts(user?.id || null);

    if (isLoadingCourse || isLoadingModules) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
                <header className="flex justify-between items-center px-8 py-6">
                    <Skeleton className="w-48 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-12 rounded-full" />
                </header>
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-1/2 rounded-xl" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="space-y-2 ml-4">
                                    {[...Array(2)].map((_, j) => (
                                        <Skeleton key={j} className="h-4 w-48" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (courseError || modulesError) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <div className="text-red-400 text-xl text-center p-8">
                    {courseError || modulesError}
                    <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={() => navigate(-1)}
                    >
                        Назад
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <header className="flex justify-between items-center px-8 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        ← Назад
                    </Button>
                    <h1 className="text-2xl font-bold">{course?.name}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <UserMenu
                            user={{ name: user.name, email: user.email }}
                            accounts={accounts}
                            onLogout={() => navigate('/login')}
                            onCreateAccount={() => navigate('/create-account')}
                        />
                    )}
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {modules?.map((module) => (
                        <ModuleAccordion
                            key={module.id}
                            module={module}
                            courseId={numericCourseId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

const ModuleAccordion = ({ module, courseId }: { module: Module; courseId: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { lessons, isLoading: isLoadingLessons } = useLessons(module.id);

    return (
        <div className="bg-gray-800/30 rounded-lg p-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center"
            >
                <h2 className="text-xl font-semibold">{module.name}</h2>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    ▼
                </motion.div>
            </button>

            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                className="overflow-hidden ml-4 mt-2 space-y-2"
            >
                {isLoadingLessons ? (
                    [...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-48" />
                    ))
                ) : (
                    lessons?.map((lesson) => (
                        <Link
                            key={lesson.id}
                            to={`/courses/${courseId}/lessons/${lesson.id}`}
                            className="block text-gray-300 hover:text-white transition-colors"
                        >
                            {lesson.name}
                        </Link>
                    ))
                )}
            </motion.div>
        </div>
    );
};