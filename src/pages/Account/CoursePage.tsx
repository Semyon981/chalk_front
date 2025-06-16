import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link, useOutletContext } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourse } from '@/hooks/useCourse';
import { useModules } from '@/hooks/useModules';
import { useLessons } from '@/hooks/useLessons';
import { type Account } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { type Module, type Lesson } from '@/api/types';
import { ChevronLeft, GripVertical, X, Edit, Check } from 'lucide-react';
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

export default React.memo(CoursePage);

function CoursePage() {
    const { courseId } = useParams<{ courseId: string }>();
    const { account } = useOutletContext<{ account: Account }>();
    const numericCourseId = parseInt(courseId || '0', 10);
    const navigate = useNavigate();

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
                        <Link to={`/accounts/${account.name}/c`}>
                            Вернуться к курсам
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
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
                                <div
                                    className={`absolute inset-0 flex items-center justify-center ${!isLoadingModules && modules.length === 0
                                        ? "opacity-100 animate-pulse"
                                        : "opacity-0 hover:opacity-100 transition-opacity"
                                        } cursor-pointer`}
                                    onClick={() => handleAddModule(0)}
                                >
                                    <div className="flex-1 h-0.5 bg-white rounded-full" />
                                </div>
                            </div>

                            {modules.map((module, index) => (
                                <React.Fragment key={module.id}>
                                    <SortableModule
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
                                        <div
                                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => handleAddModule(index + 1)}
                                        >
                                            <div className="flex-1 h-0.5 bg-white rounded-full" />
                                        </div>
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
}: {
    module: Module;
    accountName: string;
    courseId: number;
    onDelete: () => void;
    onUpdate: (name: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 0,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ModuleSection
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
}: {
    module: Module;
    accountName: string;
    courseId: number;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (name: string) => void;
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-cgray-700 rounded-lg p-6 pb-2 relative group"
        >
            <div className="flex items-center gap-2 mb-2">
                <button
                    className="hover:bg-cgray-600 cursor-grab p-1 rounded -ml-2"
                    {...dragAttributes}
                    {...dragListeners}
                >
                    <GripVertical className="h-5 w-5 text-cgray-200" />
                </button>

                {isEditing ? (
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        autoFocus
                        className="bg-cgray-800 text-cgray-50 px-2 py-1 rounded flex-1"
                    />
                ) : (
                    <h2 className="text-xl font-semibold text-cgray-50 flex-1">
                        {name}
                    </h2>
                )}

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => (isEditing ? handleUpdate() : setIsEditing(true))}
                        className="text-gray-400 hover:text-gray-200 p-1 rounded"
                    >
                        {isEditing ? <Check size={18} /> : <Edit size={18} />}
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-cgray-200 hover:text-cgray-100 p-0 rounded"
                    >
                        <X size={30} />
                    </button>
                </div>
            </div>

            <LessonsList module={module} courseId={courseId} accountName={accountName} />
        </motion.div>
    );
}

function LessonsList({
    module,
    courseId,
    accountName,
}: {
    module: Module;
    courseId: number;
    accountName: string;
}) {
    const {
        lessons: initialLessons,
        isLoading,
        // error,
        refetch: refetchLessons,
    } = useLessons(module.id);

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
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
            await setLessonPosition({
                id: Number(active.id),
                order_idx: newIndex,
            });
            await refetchLessons();
        } catch (error) {
            setLessons(initialLessons || []);
        }
    };

    const handleAddLesson = async (position: number) => {
        try {
            await createLesson({
                module_id: module.id,
                name: 'Новый урок',
                order_idx: position,
            });
            await refetchLessons();
        } catch (error) {
            console.error('Failed to create lesson:', error);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragLesson}
        >
            <SortableContext items={lessons} strategy={verticalListSortingStrategy}>
                <div className="relative h-4">
                    <div
                        className={`absolute inset-0 flex items-center justify-center ${!isLoading && lessons.length === 0
                            ? "opacity-100 animate-pulse"
                            : "opacity-0 hover:opacity-100 transition-opacity"
                            } cursor-pointer`}
                        onClick={() => handleAddLesson(0)}
                    >
                        <div className="flex-1 h-0.25 bg-white rounded-full" />
                    </div>
                </div>

                <div className="space-y-0 relative">
                    {isLoading ? (
                        <Skeleton className="h-8 w-auto rounded-full" />
                    ) : (
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {lessons.map((lesson, index) => (
                                <React.Fragment key={lesson.id}>
                                    <SortableLesson
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
                                        <div
                                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => handleAddLesson(index + 1)}
                                        >
                                            <div className="flex-1 h-0.25 bg-white rounded-full" />
                                        </div>
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
}: {
    lesson: Lesson;
    accountName: string;
    courseId: number;
    onDelete: () => void;
    onUpdate: (name: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 0,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <LessonItem
                lesson={lesson}
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

function LessonItem({
    lesson,
    // accountName,
    // courseId,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
}: {
    lesson: Lesson;
    accountName: string;
    courseId: number;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (name: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(lesson.name);
    const navigate = useNavigate();

    const handleUpdate = async () => {
        setIsEditing(false);
        if (name !== lesson.name) {
            await onUpdate(name);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="block bg-cgray-800 hover:bg-cgray-600 cursor-pointer rounded-lg p-3 transition-colors group relative"
                onClick={() => navigate(`lessons/${lesson.id}`)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <button
                            className="hover:bg-cgray-700 p-1 cursor-grab rounded -ml-2"
                            {...dragAttributes}
                            {...dragListeners}
                        >
                            <GripVertical className="h-4 w-4 text-cgray-200" />
                        </button>

                        {isEditing ? (
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleUpdate}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                autoFocus
                                className="bg-cgray-700 text-gray-100 px-2 py-1 rounded flex-1"
                            />
                        ) : (
                            <span className="text-cgray-50 flex-1">{name}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                isEditing ? handleUpdate() : setIsEditing(true);
                            }}
                            className="text-cgray-200 hover:text-cgray-100 p-1 rounded"
                        >
                            {isEditing ? <Check size={16} /> : <Edit size={16} />}
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="text-cgray-200 hover:text-cgray-100 p-0 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}