// src/components/UserMenu.tsx
// src/components/UserMenu.tsx
import { Avatar } from "./Avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline"; // Или другой иконки
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
    };
    accounts: {
        id: number;
        name: string;
    }[];
    onLogout: () => void;
    onCreateAccount?: () => void; // Новый пропс
}

export const UserMenu = ({
    user,
    accounts,
    onLogout,
    onCreateAccount
}: UserMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
                <Avatar name={user.name} />
            </button>

            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "absolute right-10 mt-2 w-80 z-50",
                            "bg-gray-900 border border-gray-800 rounded-xl shadow-lg",
                            "overflow-hidden"
                        )}
                    >
                        <div className="p-4 border-b border-gray-800">
                            <div className="flex items-center gap-3 p-2">
                                <Avatar name={user.name} size="lg" />
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{user.name}</p>
                                    <p className="text-sm text-gray-300 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 border-b border-gray-800">
                            <div className="flex justify-between items-center px-2 py-1">
                                <p className="text-sm font-medium text-gray-200">
                                    Аккаунты
                                </p>
                                {onCreateAccount && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreateAccount();
                                            setIsOpen(false);
                                        }}
                                        className="text-gray-400 hover:text-gray-300 text-sm flex items-center gap-1"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <ul>
                                {accounts.map((account) => (
                                    <li key={account.id}>
                                        <button
                                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate('/accounts/' + account.name);
                                            }}
                                        >
                                            {account.name}
                                        </button>
                                    </li>
                                ))}
                                {accounts.length === 0 && (
                                    <li className="px-3 py-2 text-sm text-gray-400">
                                        Нет аккаунтов
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="p-2">
                            <button
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                                onClick={() => {
                                    onLogout();
                                    setIsOpen(false);
                                }}
                            >
                                Выйти
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};