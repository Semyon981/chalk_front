import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link, useOutletContext } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourse } from '@/hooks/useCourse';
import { useModules } from '@/hooks/useModules';
import { useLessons } from '@/hooks/useLessons';
import { useCourseParticipants } from '@/hooks/useCourseParticipants';
import { useAuth } from '@/context/AuthContext';
import { type Account } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { type Module, type Lesson, type AccountMember } from '@/api/types';
import { ChevronLeft, GripVertical, X, Edit, Check, Trash, Pencil, ArrowLeft, Users, UserRoundPlus } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

// import UsersListModal from "@/components/UsersListModal';
import { UsersListModal } from "@/components/UsersListModal"

import { Avatar } from '@/components/Avatar';
import { unenrollUser, enrollUser, getCourseParticipants } from '@/api/courses';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    createModule,
    updateModule,
    removeModule,
    setModulePosition,
} from '@/api/modules';
import {
    createLesson,
    updateLesson,
    removeLesson,
    setLessonPosition,
} from '@/api/lessons';
import {
    removeCourse,
    updateCourse,
} from '@/api/courses';
import React from 'react';
import { getUserRoleInAccount } from '@/lib/utils';

export default React.memo(CoursePage);

function CoursePage() {
    const { courseId } = useParams<{ courseId: string }>();
    const { account, members, refetchMembers } = useOutletContext<{ account: Account, members: AccountMember[], refetchMembers: () => void }>();
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);
    const numericCourseId = parseInt(courseId || '0', 10);
    const navigate = useNavigate();

    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; message: string; onConfirm: () => void; }>({ isOpen: false, message: '', onConfirm: () => { } });

    const [isUsersListOpen, setIsUsersListOpen] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [showMembersPanel, setShowMembersPanel] = useState(false);

    useEffect(() => {
        if (user && account && members) {
            const role = getUserRoleInAccount(user.id, members);
            setUserRole(role);
            setIsCheckingRole(false);
        }
    }, [user, account, members]);


    const { members: participants, isLoading: isLoadingParticipants, error: participantsError, refetch: refetchParticipants } = useCourseParticipants(numericCourseId);

    const { course, isLoading: isLoadingCourse, error: courseError } = useCourse(numericCourseId);
    const { modules: initialModules, isLoading: isLoadingModules, error: modulesError, refetch: refetchModules } = useModules(numericCourseId);
    const [modules, setModules] = useState<Module[]>([]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (initialModules) setModules(initialModules);
    }, [initialModules]);

    const handleDragModule = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = modules.findIndex((m) => m.id === active.id);
        const newIndex = modules.findIndex((m) => m.id === over.id);
        const newModules = arrayMove(modules, oldIndex, newIndex);
        setModules(newModules);
        try {
            await setModulePosition({ id: Number(active.id), order_idx: newIndex });
            await refetchModules();
        } catch {
            setModules(initialModules || []);
        }
    };

    const handleAddModule = async (position: number) => {
        try {
            await createModule({ course_id: numericCourseId, name: 'Новый модуль', order_idx: position });
            await refetchModules();
        } catch (error) {
            console.error('Failed to create module:', error);
        }
    };

    const handleRemoveCourse = async () => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите удалить курс \"${course?.name}\"?`,
            onConfirm: async () => { await removeCourse({ id: numericCourseId }); navigate(-1); }
        });
    };

    const handleRemoveModule = async (moduleID: number, moduleName: string) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите удалить модуль \"${moduleName}\"?`,
            onConfirm: async () => { await removeModule({ id: moduleID }); await refetchModules(); }
        });
    };

    const handleEnroll = async (userId: number) => {
        await enrollUser({ id: numericCourseId, user_id: userId });
        refetchParticipants()
    };

    const handleUnenroll = async (userId: number) => {
        await unenrollUser({ id: numericCourseId, user_id: userId });
        refetchParticipants()
    };

    if (courseError) {
        return (
            <div className="text-red-400 p-8">
                {courseError}
                <div className="mt-4">
                    <Button variant="ghost"><Link to={`/accounts/${account.name}/c`}>Вернуться к курсам</Link></Button>
                </div>
            </div>
        );
    }
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingUp = currentScrollY < lastScrollY;
            lastScrollY = currentScrollY;

            if (scrollingUp && currentScrollY < 100) {
                setScrolled(false);
                return;
            }

            if (currentScrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    return (
        <div className="px-25 relative">
            <div className="flex items-center h-auto">
                <div className={`fixed cursor-pointer transition-transform duration-300 z-40 ${scrolled ? '-translate-x-15' : 'translate-x-0'}`}>
                    <ArrowLeft
                        onClick={() => navigate(-1)}
                        className="h-8 w-8"
                    />
                </div>

                {isLoadingCourse ? (
                    <Skeleton className="h-8 w-48" />
                ) : (
                    <motion.h1
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.05 }}
                        className={`text-3xl font-bold text-gray-100 transition-transform duration-300 ${scrolled ? 'translate-x-0' : 'translate-x-10'}`}
                    >
                        {course?.name}
                    </motion.h1>
                )}

                {!isCheckingRole && userRole !== 'member' && (
                    <div className="flex ml-auto items-center">
                        <div className={`fixed z-40 transition-transform duration-300 origin-center flex items-center gap-2 ${scrolled ? '-rotate-90 translate-y-2/2 -translate-x-4' : '-translate-x-2/2'}`}>
                            <button
                                onClick={() => setIsEditMode(prev => !prev)}
                                className={`${scrolled ? 'rotate-90' : ''} ${isEditMode ? 'bg-white text-black' : 'text-white hover:text-cgray-50'} flex items-center justify-center cursor-pointer h-10 w-10 rounded-full transition-transform-colors duration-300`}
                            >
                                <Pencil size={25} />
                            </button>

                            <button
                                onClick={() => setShowMembersPanel(prev => !prev)}
                                className={`${scrolled ? 'rotate-90' : ''} ${showMembersPanel ? 'bg-white text-black' : 'text-white hover:text-cgray-50'} flex items-center justify-center cursor-pointer h-10 w-10 rounded-full transition-transform-colors duration-300`}
                            >
                                <Users size={25} />
                            </button>

                            <button
                                onClick={handleRemoveCourse}
                                className={`text-red-500 transition-transform-colors duration-300 hover:text-red-400 ${scrolled ? 'rotate-90' : ''} p-2 rounded-full cursor-pointer`}
                            >
                                <Trash size={25} />
                            </button>

                        </div>
                    </div>
                )}



            </div>



            {/* Основной контент */}
            <div className="flex h-full relative">
                {/* Main Content with animated width */}
                <motion.div
                    className={`space-y-2 transition-all duration-300 z-20 ${showMembersPanel ? 'w-[70%]' : 'w-full'
                        }`}
                    // initial={{ width: '100%' }}
                    transition={{ duration: 1 }}
                >
                    {/* Modules list */}
                    {modulesError && <div className="text-red-400 p-8">{modulesError}</div>}
                    <div className="space-y-0">
                        {isLoadingModules ? (
                            Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-20 w-full rounded-lg" />)
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragModule}>
                                <SortableContext items={modules} strategy={verticalListSortingStrategy}>
                                    <div className="relative h-5">
                                        {isEditMode && (
                                            <div onClick={() => handleAddModule(0)} className={`absolute inset-0 flex items-center justify-center ${!isLoadingCourse && modules.length === 0
                                                ? 'opacity-100 animate-pulse'
                                                : 'opacity-0 hover:opacity-100 transition-opacity'} cursor-pointer`}>
                                                <div className="flex-1 h-0.5 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    {modules.map((module, index) => (
                                        <React.Fragment key={module.id}>
                                            <SortableModule
                                                isEditMode={isEditMode}
                                                module={module}
                                                accountName={account.name}
                                                courseId={numericCourseId}
                                                onDelete={() => handleRemoveModule(module.id, module.name)}
                                                onUpdate={async name => { await updateModule({ id: module.id, name }); await refetchModules(); }}
                                                setConfirmConfig={setConfirmConfig}
                                            />
                                            <div className="relative h-5">
                                                {isEditMode && (
                                                    <div onClick={() => handleAddModule(index + 1)} className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                                        <div className="flex-1 h-0.5 bg-white rounded-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </motion.div>

                {/* Members Panel with animated width */}
                <motion.aside
                    className={`fixed top-[76px] pl-4 right-0 h-[calc(100vh-76px)] w-[30%] bg-cgray-900 overflow-y-auto border-l border-cgray-700 transition-all duration-300 z-30 ${scrolled ? "" : "pt-18"} ${showMembersPanel ? "pr-25" : ""}`}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: showMembersPanel ? '30%' : 0, opacity: showMembersPanel ? 1 : 0 }}
                    transition={{ duration: 0 }}
                    style={{ overflow: 'hidden' }}
                >
                    {showMembersPanel && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-100 text-nowrap">
                                    Проходят курс
                                </h3>
                                <button
                                    onClick={() => { setIsUsersListOpen(true) }}
                                    className="px-1 py-1 text-white hover:text-cgray-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <UserRoundPlus />
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {participants.map(member => (
                                    <div
                                        key={member.user.id}
                                        className="flex justify-between items-center p-2 bg-cgray-700 rounded-lg transition-colors hover:bg-cgray-600"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <Avatar name={member.user.name} size="sm" />
                                            <div className="text-cgray-100 flex flex-col">
                                                <span className="font-small">{member.user.name}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleUnenroll(member.user.id)}
                                            className="text-red-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                            aria-label="Удалить участника"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                ))}
                            </ul>
                        </>
                    )}
                </motion.aside>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                message={confirmConfig.message}
                onConfirm={async () => { await confirmConfig.onConfirm(); setConfirmConfig(prev => ({ ...prev, isOpen: false })); }}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />

            <UsersListModal
                isOpen={isUsersListOpen}
                availableMembers={members.filter(m => !participants.some(p => p.user.id === m.user.id))}
                onClose={() => setIsUsersListOpen(false)}
                onClick={async (memberId) => { await handleEnroll(memberId); setIsUsersListOpen(false); }}
            />
        </div>
    );
}


function SortableModule({
    module,
    accountName,
    courseId,
    onDelete,
    onUpdate,
    isEditMode,
    setConfirmConfig
}: {
    module: Module;
    accountName: string;
    courseId: number;
    onDelete: () => void;
    onUpdate: (name: string) => void;
    isEditMode: boolean;
    setConfirmConfig: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>>
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: module.id });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 0,
    };
    return (
        <div ref={setNodeRef} style={style}>
            <ModuleSection
                isEditMode={isEditMode}
                module={module}
                accountName={accountName}
                courseId={courseId}
                dragAttributes={attributes}
                dragListeners={listeners}
                onDelete={onDelete}
                onUpdate={onUpdate}
                setConfirmConfig={setConfirmConfig}
            />
        </div>
    );
}

function ModuleSection({
    module,
    accountName,
    courseId,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
    isEditMode,
    setConfirmConfig
}: {
    module: Module;
    accountName: string;
    courseId: number;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (name: string) => void;
    isEditMode: boolean;
    setConfirmConfig: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>>
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(module.name);

    const handleUpdate = async () => {
        setIsEditing(false);
        if (name !== module.name) {
            await onUpdate(name);
        }
    };

    return (
        <div className="group relative">
            {isEditMode &&
                <>
                    <button
                        className="absolute -left-8 top-9 flex opacity-0 group-hover:opacity-100 p-1 cursor-grab rounded -translate-y-1/2 z-10"
                        {...dragAttributes}
                        {...dragListeners}
                    >
                        <GripVertical className="h-6 w-6 text-cgray-200" />
                    </button>

                    <button
                        onClick={onDelete}
                        className="absolute -right-8 top-9 flex opacity-0 group-hover:opacity-100 -translate-y-1/2 z-10 p-1 cursor-pointer hover:text-red-400 text-red-500"
                    >
                        <Trash size={24} />
                    </button>
                </>
            }


            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-cgray-700 rounded-lg pl-8 pr-8 pt-5 pb-2"
            >
                <div className="flex items-center gap-2 mb-2">
                    {isEditing ? (
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleUpdate}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            autoFocus
                            className=" text-cgray-50 text-xl font-semibold flex-1 focus:outline-none border-b border-gray-500"
                        />
                    ) : (
                        <h2
                            onClick={() => isEditMode && setIsEditing(true)}
                            className="text-xl font-semibold text-cgray-50 flex-1 cursor-text"
                        >
                            {name}
                        </h2>
                    )}
                </div>

                <LessonsList module={module} courseId={courseId} accountName={accountName} isEditMode={isEditMode} setConfirmConfig={setConfirmConfig} />
            </motion.div>
        </div>
    );
}

function LessonsList({
    module,
    courseId,
    accountName,
    isEditMode,
    setConfirmConfig
}: {
    module: Module;
    courseId: number;
    accountName: string;
    isEditMode: boolean;
    setConfirmConfig: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>>
}) {
    const {
        lessons: initialLessons,
        isLoading,
        refetch: refetchLessons,
    } = useLessons(module.id);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleRemoveLesson = async (lessonID: number, lessonName: string) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите удалить урок "${lessonName}?"`,
            onConfirm: async () => {
                await removeLesson({ id: lessonID });
                await refetchLessons();
            },
        });
    }

    useEffect(() => {
        if (initialLessons) setLessons(initialLessons);
    }, [initialLessons]);

    const handleDragLesson = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = lessons.findIndex((l) => l.id === active.id);
        const newIndex = lessons.findIndex((l) => l.id === over.id);
        const newLessons = arrayMove(lessons, oldIndex, newIndex);

        setLessons(newLessons);

        try {
            await setLessonPosition({ id: Number(active.id), order_idx: newIndex });
            await refetchLessons();
        } catch {
            setLessons(initialLessons || []);
        }
    };

    const handleAddLesson = async (position: number) => {
        try {
            await createLesson({ module_id: module.id, name: 'Новый урок', order_idx: position });
            await refetchLessons();
        } catch (error) {
            console.error('Failed to create lesson:', error);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragLesson}>
            <SortableContext items={lessons} strategy={verticalListSortingStrategy}>

                <div className="relative h-4">
                    {isEditMode &&
                        <div
                            className={`absolute inset-0 flex items-center justify-center ${!isLoading && lessons.length === 0
                                ? 'opacity-100 animate-pulse'
                                : 'opacity-0 hover:opacity-100 transition-opacity'
                                } cursor-pointer`}
                            onClick={() => handleAddLesson(0)}
                        >
                            <div className="flex-1 h-0.25 bg-white rounded-full" />
                        </div>
                    }
                </div>

                <div className="space-y-0 relative">
                    {isLoading ? (
                        <Skeleton className="h-8 w-auto rounded-full" />
                    ) : (
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {lessons.map((lesson, index) => (
                                <React.Fragment key={lesson.id}>
                                    <SortableLesson
                                        isEditMode={isEditMode}
                                        lesson={lesson}
                                        accountName={accountName}
                                        courseId={courseId}
                                        onDelete={async () => {
                                            handleRemoveLesson(lesson.id, lesson.name)
                                        }}
                                        onUpdate={async (name: string) => {
                                            await updateLesson({ id: lesson.id, name });
                                            await refetchLessons();
                                        }}

                                    />
                                    <div className="relative h-4">
                                        {isEditMode &&
                                            <div
                                                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                                onClick={() => handleAddLesson(index + 1)}
                                            >
                                                <div className="flex-1 h-0.25 bg-white rounded-full" />
                                            </div>
                                        }
                                    </div>
                                </React.Fragment>
                            ))}
                        </motion.h1>
                    )}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableLesson({
    lesson,
    accountName,
    courseId,
    onDelete,
    onUpdate,
    isEditMode,
}: {
    lesson: Lesson;
    accountName: string;
    courseId: number;
    onDelete: () => void;
    onUpdate: (name: string) => void;
    isEditMode: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: lesson.id });
    const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 100 : 0 };
    return (
        <div ref={setNodeRef} style={style}>
            <LessonItem lesson={lesson} dragAttributes={attributes} dragListeners={listeners} onDelete={onDelete} onUpdate={onUpdate} isEditMode={isEditMode} />
        </div>
    );
}

function LessonItem({
    lesson,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
    isEditMode,
}: {
    lesson: Lesson;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (name: string) => void;
    isEditMode: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(lesson.name);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async () => {
        setIsEditing(false);
        if (name !== lesson.name) await onUpdate(name);
    };

    return (
        <div
            className="relative w-full mx-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isEditMode &&
                <>
                    <button {...dragAttributes} {...dragListeners} className={`absolute -left-7 top-1/2 transform -translate-y-1/2 p-1 rounded z-10 ${isHovered ? 'opacity-100 hover:bg-cgray-700 cursor-grab' : 'opacity-0'} transition-opacity`}>
                        <GripVertical className="h-5 w-5 text-cgray-200" />
                    </button>
                    <button onClick={onDelete} className={`absolute -right-7 top-1/2 transform -translate-y-1/2 z-10 p-1 text-red-500 cursor-pointer ${isHovered ? 'opacity-100 hover:text-red-400' : 'opacity-0'} transition-opacity`}>
                        <Trash size={20} />
                    </button>
                </>
            }


            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div
                    className="bg-cgray-800 hover:bg-cgray-600 cursor-pointer rounded-lg p-3 transition-colors"
                    onClick={() => {
                        if (!isEditMode) {
                            navigate(`lessons/${lesson.id}`)
                            return
                        }

                        if (!isEditing) {
                            setIsEditing(true)
                        }
                    }}
                // onClick={() => { () => navigate(`lessons/${lesson.id}`) }}
                >
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleUpdate}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                autoFocus
                                className="text-gray-100 flex-1 focus:outline-none border-b border-gray-500"
                            />
                        ) : (
                            <span className={`text-cgray-50 ${isEditMode ? "cursor-text" : ""} flex-1`}>{name}</span>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
