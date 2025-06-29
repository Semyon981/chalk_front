import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import useAccounts from "@/hooks/useAccounts";
import useAccount from '@/hooks/useAccount';
import { Skeleton } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { getUserRoleInAccount } from '@/lib/utils';
import useAccountUsers from '@/hooks/useAccountUsers';
import { useEffect, useState } from 'react';

export default function AccountPage() {
    const { accountName } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const { account, isLoading: isLoadingAccount, error: accountError } = useAccount(accountName);
    const { accounts } = useAccounts(user?.id || null);
    const { members, isLoading: isLoadingUsers, error: usersError, refetch: refetchMembers } = useAccountUsers(account?.id);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    useEffect(() => {
        if (!isLoadingAccount && !isLoadingUsers && user && account && members) {
            const role = getUserRoleInAccount(user.id, members);
            setUserRole(role);
            setIsCheckingRole(false);
        }
    }, [isLoadingAccount, isLoadingUsers, user, account, members]);

    const tabs = [
        { id: 'users', label: 'Пользователи', path: 'users', roles: ['owner', 'admin', 'member'] },
        { id: 'courses', label: 'Курсы', path: 'courses', roles: ['owner', 'admin'] },
        { id: 'my-courses', label: 'Мои курсы', path: 'my-courses', roles: ['owner', 'admin', 'member'] },
    ];

    if (isLoadingAccount || isLoadingUsers || isCheckingRole) {
        return (
            <div className="min-h-screen bg-cgray-900 text-white">
                <header className="flex justify-between items-center px-8 py-6">
                    <Skeleton className="w-48 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-12 rounded-full" />
                </header>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex gap-4 mb-8">
                        {tabs.map(tab => (
                            <Skeleton key={tab.id} className="w-24 h-10 rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (accountError || usersError || !userRole) {
        return (
            <div className="min-h-screen bg-cgray-900 flex items-center justify-center">
                <div className="text-red-400 text-xl text-center p-8">
                    {accountError}
                    <br />
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

    const filteredTabs = tabs.filter(tab => tab.roles.includes(userRole));

    return (
        <div className="min-h-screen bg-cgray-900 text-white">
            <header className="fixed top-0 left-0 right-0 z-50 bg-cgray-900/10 backdrop-blur-md">
                <div className="flex items-center justify-between min-h-16">
                    {/* Левый блок - название аккаунта */}
                    <div className="flex items-center min-w-0 flex-none pl-8">
                        <h1 className="text-2xl font-semibold text-gray-100 truncate">
                            {account?.name}
                        </h1>
                    </div>

                    {/* Центральный блок - табы */}
                    <nav className="flex flex-1 justify-center px-4 hide-scrollbar">
                        <div className="flex gap-1">
                            {filteredTabs.map((tab) => {
                                const to = `/accounts/${accountName}/${tab.path}`;
                                const isActive = location.pathname === to;

                                return (
                                    <Link
                                        key={tab.id}
                                        to={to}
                                        className={`
                                relative px-3 py-2 text-sm rounded-md transition-colors
                                ${isActive
                                                ? 'text-white bg-cgray-700'
                                                : 'text-cgray-200 hover:bg-cgray-500/40'
                                            }
                            `}
                                    >
                                        {tab.label}
                                        {/* {isActive && (
                                            <motion.div
                                                layoutId="account-tab-underline"
                                                className="absolute inset-x-1 -bottom-px h-1 bg-cgray-400"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )} */}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Правый блок - меню пользователя */}
                    <div className="flex items-center gap-4 shrink-0 pr-8">
                        {user && (
                            <UserMenu
                                user={{ name: user.name, email: user.email }}
                                accounts={accounts}
                                onLogout={() => navigate('/login')}
                                onCreateAccount={() => navigate('/create-account')}
                            />
                        )}
                    </div>
                </div>
            </header>

            <div className="pt-20 mx-auto py-8">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <Outlet context={{ account, members, refetchMembers }} />
                </motion.div>
            </div>
        </div>
    );
}