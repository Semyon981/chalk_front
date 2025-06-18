import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link, useOutletContext } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourse } from '@/hooks/useCourse';
import { useModules } from '@/hooks/useModules';
import { useLessons } from '@/hooks/useLessons';
import { useAuth } from '@/context/AuthContext';
import { type Account } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { type Module, type Lesson, type AccountMember } from '@/api/types';
import { ChevronLeft, GripVertical, X, Edit, Check, Trash } from 'lucide-react';
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

    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (user && account && members) {
            const role = getUserRoleInAccount(user.id, members);
            setUserRole(role);
            setIsCheckingRole(false);
        }
    }, [user, account, members]);


    const {
        course,
        isLoading: isLoadingCourse,
        error: courseError,
    } = useCourse(numericCourseId);

    const {
        modules: initialModules,
        isLoading: isLoadingModules,
        error: modulesError,
        refetch: refetchModules,
    } = useModules(numericCourseId);

    const [modules, setModules] = useState<Module[]>([]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
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
            await setModulePosition({
                id: Number(active.id),
                order_idx: newIndex,
            });
            await refetchModules();
        } catch (error) {
            setModules(initialModules || []);
        }
    };

    const handleAddModule = async (position: number) => {
        try {
            await createModule({
                course_id: numericCourseId,
                name: 'Новый модуль',
                order_idx: position,
            });
            await refetchModules();
        } catch (error) {
            console.error('Failed to create module:', error);
        }
    };

    if (courseError) {
        return (
            <div className="text-red-400 p-8">
                {courseError}
                <div className="mt-4">
                    <Button variant="ghost">
                        <Link to={`/accounts/${account.name}/c`}>Вернуться к курсам</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {isLoadingCourse ? (
                        <Skeleton className="h-8 w-48" />
                    ) : (
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-100"
                        >
                            {course?.name}
                        </motion.h1>
                    )}
                </div>

                {!isCheckingRole && (userRole == 'admin' || userRole === 'owner') &&
                    <Button
                        variant={isEditMode ? 'light' : 'ghost'}
                        onClick={() => setIsEditMode((prev) => !prev)}
                        className="flex items-center gap-2 h-10 px-4 min-w-[120px]"
                    >
                        {isEditMode ? <Check /> : <Edit />}
                        <span>{isEditMode ? 'Сохранить' : 'Редактировать'}</span>
                    </Button>
                }
            </div>

            {modulesError && <div className="text-red-400 p-8">{modulesError}</div>}

            <div className="space-y-0">
                {isLoadingModules ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-20 w-full rounded-lg" />
                    ))
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragModule}
                    >
                        <SortableContext
                            items={modules}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="relative h-5">
                                {isEditMode &&
                                    <div
                                        className={`absolute inset-0 flex items-center justify-center ${!isLoadingModules && modules.length === 0
                                            ? 'opacity-100 animate-pulse'
                                            : 'opacity-0 hover:opacity-100 transition-opacity'
                                            } cursor-pointer`}
                                        onClick={() => handleAddModule(0)}
                                    >
                                        <div className="flex-1 h-0.5 bg-white rounded-full" />
                                    </div>
                                }
                            </div>

                            {modules.map((module, index) => (
                                <React.Fragment key={module.id}>
                                    <SortableModule
                                        isEditMode={isEditMode}
                                        module={module}
                                        accountName={account.name}
                                        courseId={numericCourseId}
                                        onDelete={async () => {
                                            await removeModule({ id: module.id });
                                            await refetchModules();
                                        }}
                                        onUpdate={async (name: string) => {
                                            await updateModule({ id: module.id, name });
                                            await refetchModules();
                                        }}
                                    />
                                    <div className="relative h-5">
                                        {isEditMode &&
                                            <div
                                                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                                onClick={() => handleAddModule(index + 1)}
                                            >
                                                <div className="flex-1 h-0.5 bg-white rounded-full" />
                                            </div>
                                        }
                                    </div>
                                </React.Fragment>
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}

function SortableModule({
    module,
    accountName,
    courseId,
    onDelete,
    onUpdate,
    isEditMode
}: {
    module: Module;
    accountName: string;
    courseId: number;
    onDelete: () => void;
    onUpdate: (name: string) => void;
    isEditMode: boolean;
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
}: {
    module: Module;
    accountName: string;
    courseId: number;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (name: string) => void;
    isEditMode: boolean;
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

                <LessonsList module={module} courseId={courseId} accountName={accountName} isEditMode={isEditMode} />
            </motion.div>
        </div>
    );
}

function LessonsList({
    module,
    courseId,
    accountName,
    isEditMode,
}: {
    module: Module;
    courseId: number;
    accountName: string;
    isEditMode: boolean;
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
                                            await removeLesson({ id: lesson.id });
                                            await refetchLessons();
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
