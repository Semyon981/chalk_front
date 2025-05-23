import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "@/components/UserMenu";
import { useState, useEffect } from "react";
import { getUserAccounts } from "@/api/users";
import useAccounts from "@/hooks/useAccounts";

export default function HomePage() {
    const navigate = useNavigate();
    const { user, isLoading, handleLogout } = useAuth();
    const { accounts, isLoading: isLoadingAccs, } = useAccounts(user?.id || null);

    return isLoading || isLoadingAccs ? (<div className="min-h-screen bg-gradient-to-b from-blue-900 to-black" />) : (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
            <header className="flex justify-between items-center px-8 py-4 bg-blue-950 shadow-md">
                <h1 className="text-2xl font-bold text-white">Courso.ru</h1>
                <div className="flex items-center gap-4">
                    {user ? (
                        <UserMenu
                            user={{ name: user.name, email: user.email }}
                            accounts={accounts}
                            onLogout={handleLogout}
                            onCreateAccount={() => navigate('/create-account')}
                        />
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => navigate('/login')}>
                                Войти
                            </Button>
                            <Button variant="light" onClick={() => navigate('/register')}>
                                Зарегистрироваться
                            </Button>
                        </>
                    )}
                </div>
            </header>
            <main className="flex flex-col items-center justify-center text-center px-4 py-20">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl font-extrabold mb-6 text-white"
                >
                    Ваша платформа для онлайн-обучения
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-lg text-blue-200 max-w-2xl mb-8"
                >
                    Courso.ru — это мощный инструмент для преподавателей и студентов: создавайте курсы, отслеживайте прогресс и улучшайте обучение с помощью современных технологий.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 mb-16"
                >
                    <Button size="lg" variant="light" onClick={() => navigate('/register')}>
                        Начать обучение
                    </Button>
                    <Button size="lg" variant="ghost" onClick={() => navigate('/courses')}>
                        Посмотреть курсы
                    </Button>
                </motion.div>

                <div className="grid gap-6 max-w-5xl w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
                    <Feature title="Управление курсами" description="Создавайте модули, уроки, блоки, видео и задания в удобном редакторе." />
                    <Feature title="Отслеживание прогресса" description="Следите за успеваемостью студентов и получайте аналитику по каждому курсу." />
                    <Feature title="Гибкая регистрация" description="Лёгкий вход и регистрация для студентов и преподавателей." />
                    <Feature title="Современный дизайн" description="Интуитивно понятный и приятный интерфейс на всех устройствах." />
                    <Feature title="Безопасность данных" description="Ваши данные надёжно защищены с использованием современных стандартов безопасности." />
                    <Feature title="Интеграция API" description="Расширьте возможности платформы с помощью готового API-интерфейса." />
                </div>
            </main>
        </div>
    );
}

function Feature({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-blue-800 bg-opacity-50 p-6 rounded-2xl shadow-md h-full">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-blue-200 text-sm">{description}</p>
        </div>
    );
}
