import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import useAccounts from "@/hooks/useAccounts";
import useAccount from '@/hooks/useAccount';
import { UsersTab } from '@/components/UsersTab';
import { CoursesTab } from '@/components/CoursesTab';
import { Skeleton } from '@/components/ui/Skeleton';
import useAccountUsers from '@/hooks/useAccountUsers';
import useAccountCourses from '@/hooks/useAccountCourses';
import useAccountMemberCourses from '@/hooks/useAccountMemberCourses';

export default function AccountPage() {
    const { accountName } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Current account data
    const { account, isLoading: isLoadingAccount, error: accountError } = useAccount(accountName);

    // User's accounts for menu
    const { accounts } = useAccounts(user?.id || null);

    // Tabs data
    const [activeTab, setActiveTab] = useState('users');
    const { members, isLoading: isLoadingUsers, error: usersError } = useAccountUsers(account?.id);
    const { courses, isLoading: isLoadingCourses, error: coursesError } = useAccountCourses(account?.id);
    const { courses: myCourses, isLoading: isLoadingMyCourses, error: myCoursesError } = useAccountMemberCourses(account?.id, user?.id);

    const tabs = [
        { id: 'users', label: 'Пользователи' },
        { id: 'courses', label: 'Курсы' },
        { id: 'my-courses', label: 'Мои курсы' },
    ];

    if (isLoadingAccount) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
                <header className="flex justify-between items-center px-8 py-6">
                    <Skeleton className="w-48 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-12 rounded-full" />
                </header>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex gap-4 mb-8">
                        <Skeleton className="w-24 h-10 rounded-lg" />
                        <Skeleton className="w-24 h-10 rounded-lg" />
                        <Skeleton className="w-24 h-10 rounded-lg" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (accountError) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <div className="text-red-400 text-xl text-center p-8">
                    {accountError}
                    <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={() => navigate('/')}
                    >
                        Вернуться на главную
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <header className="flex justify-between items-center px-8 py-6">
                <h1 className="text-2xl font-bold text-white">{account?.name}</h1>
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
                <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-4 relative whitespace-nowrap ${activeTab === tab.id ? 'text-gray-300' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400 rounded-t"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    {activeTab === 'users' && (
                        <UsersTab
                            members={members}
                            isLoading={isLoadingUsers}
                            error={usersError}
                        />
                    )}

                    {activeTab === 'courses' && (
                        <CoursesTab
                            courses={courses}
                            isLoading={isLoadingCourses}
                            error={coursesError}
                        />
                    )}

                    {activeTab === 'my-courses' && (
                        <CoursesTab
                            courses={myCourses}
                            isLoading={isLoadingMyCourses}
                            error={myCoursesError}
                            title="Мои курсы"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}