import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Link, useOutletContext } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLesson } from "@/hooks/useLesson";
import { useBlocks } from "@/hooks/useBlocks";
import type {
    Account,
    BlockType,
    UpdateBlockRequest,
    Block,
    AccountMember,
    Attempt,
} from "@/api/types";
import { ConfirmModal } from '@/components/ConfirmModal';
import { removeLesson } from '@/api/lessons';
import { Button } from "@/components/ui/Button";
import {
    ChevronLeft,
    GripVertical,
    X,
    Edit,
    Check,
    Upload,
    Video,
    Text,
    Trash,
    SquareGanttChartIcon,
    Pencil,
    Loader2,
    ArrowLeft
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    createBlock,
    updateBlock,
    removeBlock,
    setBlockPosition,
} from "@/api/blocks";
import { getFileUrl, uploadFile } from "@/api/files";
import React from "react";
import TiptapEditor from "@/components/TiptapEditor";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { getUserRoleInAccount } from "@/lib/utils";
import TestContent, { type TestContentProps } from "@/components/TestContent";
import {
    finishAttempt,
    getCurrentAttempt,
    getFinishedAttempts,
    startAttempt,
} from "@/api/tests";

export default function LessonPage() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const { account, members } = useOutletContext<{
        account: Account;
        members: AccountMember[];
    }>();
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    const numericLessonId = parseInt(lessonId || "0", 10);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && account && members) {
            const role = getUserRoleInAccount(user.id, members);
            setUserRole(role);
            setIsCheckingRole(false);
        }
    }, [user, account, members]);

    const {
        lesson,
        isLoading: isLoadingLesson,
        error: lessonError,
        // refetch: refetchLesson,
    } = useLesson(numericLessonId);

    const {
        blocks: initialBlocks,
        isLoading: isLoadingBlocks,
        error: blocksError,
        refetch: refetchBlocks,
    } = useBlocks(numericLessonId);

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (initialBlocks) setBlocks(initialBlocks);
    }, [initialBlocks]);

    const handleDragBlock = async (event: DragEndEvent) => {
        if (!isEditMode) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);

        setBlocks(newBlocks);

        try {
            await setBlockPosition({
                id: Number(active.id),
                order_idx: newIndex,
            });
            await refetchBlocks();
        } catch (error) {
            setBlocks(initialBlocks || []);
        }
    };

    const [showPopup, setShowPopup] = useState(false);
    const [insertPosition, setInsertPosition] = useState(0);
    const [popupCoords, setPopupCoords] = useState({ x: 0, y: 0 });

    const handleAddBlock = async (position: number, type: BlockType) => {
        if (!isEditMode) return;
        try {
            await createBlock({
                lesson_id: numericLessonId,
                type,
                content: type === "text" ? "" : "",
                name: type === "test" ? "Новый тест" : undefined,
                order_idx: position,
            });
            await refetchBlocks();
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    const handleLineClick = (e: React.MouseEvent, position: number) => {
        if (!isEditMode) return;
        e.stopPropagation();
        setPopupCoords({ x: e.clientX, y: e.clientY });
        setInsertPosition(position);
        setShowPopup(true);
    };

    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; message: string; onConfirm: () => void; }>({ isOpen: false, message: '', onConfirm: () => { } });

    const handleRemoveLesson = async (lessonID: number, lessonName: string) => {
        setConfirmConfig({
            isOpen: true,
            message: `Вы действительно хотите удалить урок \"${lessonName}\"?`,
            onConfirm: async () => { await removeLesson({ id: lessonID }); navigate(-1); }
        });
    }

    if (lessonError) {
        return (
            <div className="text-red-400 p-8">
                {lessonError}
                <div className="mt-4">
                    <Button variant="ghost">
                        <Link to={`/accounts/${account.name}/courses`}>
                            Вернуться к курсам
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const visibleBlocks = !isEditMode
        ? blocks.filter((b) => !(b.type === "video" && !b.file_id))
        : blocks;

    return (
        <div className="space-y-2 px-25">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        className=" text-gray-100 hover:text-white cursor-pointer"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-8 w-8" />
                    </button>
                    {isLoadingLesson ? (
                        <Skeleton className="h-8 w-48" />
                    ) : (
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-100"
                        >
                            {lesson?.name}
                        </motion.h1>
                    )}
                </div>
                {!isCheckingRole && (userRole == 'admin' || userRole === 'owner') &&
                    // <Button
                    //     variant={isEditMode ? 'light' : 'ghost'}
                    //     onClick={() => setIsEditMode((prev) => !prev)}
                    //     className="flex items-center gap-2 h-10 px-4 min-w-[120px]"
                    // >
                    //     {isEditMode ? <Check /> : <Edit />}
                    //     <span>{isEditMode ? 'Сохранить' : 'Редактировать'}</span>
                    // </Button>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditMode(prev => !prev)} className={`${isEditMode ? 'bg-white text-gray-900 hover:bg-gray-300' : 'text-white hover:text-cgray-50'} p-2 rounded-full transition-colors cursor-pointer`}>
                            {isEditMode ? <Check size={25} /> : <Pencil size={25} />}
                        </button>
                        <button onClick={() => { { lesson && handleRemoveLesson(lesson?.id, lesson?.name) } }} className="text-red-500 hover:text-red-400 p-2 rounded-full cursor-pointer">
                            <Trash size={25} />
                        </button>
                        {/* <button onClick={() => setShowMembersPanel(prev => !prev)} className="cursor-pointer p-2 rounded-full border-2 border-white hover:border-cgray-50 text-white hover:text-cgray-50 transition-colors duration-100">
                            <Users size={25} />
                        </button> */}
                    </div>
                }
            </div>

            {blocksError && (
                <div className="text-red-400 p-8">{blocksError}</div>
            )}

            <div className="space-y-0">
                {isLoadingBlocks ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                        <Skeleton
                            key={idx}
                            className="h-20 w-full rounded-lg"
                        />
                    ))
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragBlock}
                    >
                        <SortableContext
                            items={blocks}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="relative h-5">
                                {isEditMode && (
                                    <div
                                        className={`absolute inset-0 flex items-center justify-center ${!isLoadingBlocks &&
                                                blocks.length === 0
                                                ? "opacity-100 animate-pulse"
                                                : "opacity-0 hover:opacity-100 transition-opacity"
                                            } cursor-pointer`}
                                        onClick={(e) => handleLineClick(e, 0)}
                                    >
                                        <div className="flex-1 h-0.5 bg-white rounded-full" />
                                    </div>
                                )}
                            </div>

                            {visibleBlocks.map((block, index) => (
                                <React.Fragment key={block.id}>
                                    <SortableBlock
                                        block={block}
                                        isEditMode={isEditMode}
                                        onDelete={async () => {
                                            await removeBlock({ id: block.id });
                                            await refetchBlocks();
                                        }}
                                        onUpdate={async (
                                            payload: UpdateBlockRequest
                                        ) => {
                                            await updateBlock(payload);
                                            await refetchBlocks();
                                        }}
                                    // onFileUpload={async (file: File) => {
                                    //     const resp = await uploadFile(file);
                                    //     return resp.data.id;
                                    // }}
                                    />
                                    <div className="relative h-5">
                                        {isEditMode && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                                onClick={(e) =>
                                                    handleLineClick(
                                                        e,
                                                        index + 1
                                                    )
                                                }
                                            >
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
            {showPopup && (
                <BlockTypePopup
                    x={popupCoords.x}
                    y={popupCoords.y}
                    onClose={() => setShowPopup(false)}
                    onSelect={(type) => {
                        handleAddBlock(insertPosition, type);
                        setShowPopup(false);
                    }}
                />
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                message={confirmConfig.message}
                onConfirm={async () => { await confirmConfig.onConfirm(); setConfirmConfig(prev => ({ ...prev, isOpen: false })); }}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />


        </div>
    );
}

function BlockTypePopup({
    x,
    y,
    onClose,
    onSelect,
}: {
    x: number;
    y: number;
    onClose: () => void;
    onSelect: (type: BlockType) => void;
}) {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={popupRef}
            className="fixed bg-cgray-800 rounded-lg p-1 shadow-xl z-50 flex flex-col gap-2"
            style={{
                left: x - 40,
                top: y + 10,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <button
                onClick={() => onSelect("text")}
                className="p-2 hover:bg-cgray-600 rounded-lg flex items-center gap-2 w-20"
            >
                <Text className="h-5 w-5 text-green-400" />
                <span className="text-sm">Текст</span>
            </button>

            <button
                onClick={() => onSelect("video")}
                className="p-2 hover:bg-cgray-600 rounded-lg flex items-center gap-2 w-20"
            >
                <Video className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Видео</span>
            </button>
            <button
                onClick={() => onSelect("test")}
                className="p-2 hover:bg-cgray-600 rounded-lg flex items-center gap-2 w-20"
            >
                <SquareGanttChartIcon className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Тест</span>
            </button>
        </motion.div>
    );
}

function SortableBlock({
    block,
    onDelete,
    onUpdate,
    // onFileUpload,
    isEditMode,
}: {
    block: Block;
    onDelete: () => void;
    onUpdate: (payload: UpdateBlockRequest) => void;
    isEditMode: boolean;
    // onFileUpload: (file: File) => Promise<number>;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 0,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <BlockSection
                isEditMode={isEditMode}
                block={block}
                dragAttributes={attributes}
                dragListeners={listeners}
                onDelete={onDelete}
                onUpdate={onUpdate}
            // onFileUpload={onFileUpload}
            />
        </div>
    );
}

function BlockSection({
    block,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
    // onFileUpload,
    isEditMode,
}: {
    block: Block;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (payload: UpdateBlockRequest) => void;
    isEditMode: boolean;
    // onFileUpload: (file: File) => Promise<number>;
}) {
    return (
        <div className="group relative">
            {block.type === "text" ? (
                <TextBlock
                    block={block}
                    dragAttributes={dragAttributes}
                    dragListeners={dragListeners}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    isEditMode={isEditMode}
                />
            ) : block.type === "video" ? (
                <VideoBlock
                    block={block}
                    dragAttributes={dragAttributes}
                    dragListeners={dragListeners}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    isEditMode={isEditMode}
                />
            ) : block.type === "test" ? (
                <TestBlock
                    block={block}
                    dragAttributes={dragAttributes}
                    dragListeners={dragListeners}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    isEditMode={isEditMode}
                />
            ) : null}
        </div>
    );
}

function TextBlock({
    block,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
    isEditMode,
}: {
    block: Block;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (payload: UpdateBlockRequest) => void;
    isEditMode: boolean;
}) {
    const [isInnerEditing, setIsInnerEditing] = useState(false);
    const [content, setContent] = useState(block.content || "");

    const handleUpdate = async () => {
        setIsInnerEditing(false);
        await onUpdate({ id: block.id, content });
    };

    return (
        <>
            {isEditMode && (
                <div>
                    <button
                        className="absolute -left-8 top-[1rem] flex opacity-0 group-hover:opacity-100 hover:bg-cgray-600 p-1 rounded z-10"
                        {...dragAttributes}
                        {...dragListeners}
                    >
                        <GripVertical className="h-5 w-5 cursor-grab text-cgray-200" />
                    </button>

                    <div className="absolute -right-8 top-[1rem] flex opacity-0 group-hover:opacity-100 z-10">
                        <button
                            onClick={onDelete}
                            className="text-red-500 cursor-pointer hover:text-red-400 p-1"
                        >
                            <Trash size={20} />
                        </button>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-cgray-700 rounded-lg relative w-full"
            >
                {isInnerEditing ? (
                    <TiptapEditor
                        initialContent={content}
                        onUpdate={setContent}
                        onBlur={handleUpdate}
                    />
                ) : (
                    <div
                        className="text-gray-100 prose prose-invert max-w-none min-h-[4rem] p-2 cursor-text"
                        onClick={() => isEditMode && setIsInnerEditing(true)}
                    >
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                )}
            </motion.div>
        </>
    );
}

function VideoBlock({
    block,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
    isEditMode,
}: {
    block: Block;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (payload: UpdateBlockRequest) => void;
    isEditMode: boolean;
}) {
    const [fileId, setFileId] = useState(block.file_id);
    const [isHovered, setIsHovered] = useState(false);
    // const [isLoadedMetadata, setIsLoadedMetadata] = useState(false);
    // const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const [previewReady, setPreviewReady] = useState(false);
    // const [videoReady, setVideoReady] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        const previewUrl = URL.createObjectURL(file);
        setUploadProgress(0);
        setVideoPreviewUrl(previewUrl);

        try {
            abortControllerRef.current = new AbortController();

            // const resp = await uploadFile(file);
            const resp = await uploadFile(file, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) /
                        (progressEvent.total || 1)
                    );
                    setUploadProgress(percentCompleted);
                },
                signal: abortControllerRef.current.signal,
            });

            setFileId(resp.data.id);
            onUpdate({ id: block.id, file_id: resp.data.id });
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("File upload failed:", error);
            }
        } finally {
            setVideoPreviewUrl(null);
            URL.revokeObjectURL(previewUrl);
            abortControllerRef.current = null;
        }
    };

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setVideoPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
        >
            <div className="flex justify-start">
                <div className="relative w-auto h-auto">
                    {isEditMode && (
                        <div>
                            <button
                                className="absolute -left-8 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 hover:bg-cgray-600 p-1 rounded z-10"
                                {...dragAttributes}
                                {...dragListeners}
                            >
                                <GripVertical className="h-5 w-5 cursor-grab text-cgray-200" />
                            </button>
                            <button
                                onClick={onDelete}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 z-10 text-red-500 cursor-pointer hover:text-red-400 p-1"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    )}
                    {fileId ? (
                        <video
                            controls={isHovered}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="block h-full w-auto max-h-100 object-contain rounded-lg"
                            src={`${getFileUrl(fileId)}`}
                        />
                    ) : (
                        <div className="relative w-auto h-auto">
                            {videoPreviewUrl && (
                                <div
                                    className="relative w-auto h-auto"
                                    hidden={!previewReady}
                                >
                                    <video
                                        className="block h-full w-auto max-h-100 object-contain rounded-lg"
                                        muted
                                        autoPlay
                                        loop
                                        controls={false}
                                        src={videoPreviewUrl}
                                        onLoadedMetadata={() => {
                                            setPreviewReady(true);
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 rounded-lg">
                                        <div className="relative w-20 h-20">
                                            <CircularProgress
                                                progress={uploadProgress}
                                                className="text-white"
                                                onCancel={handleCancelUpload}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(videoPreviewUrl == null || !previewReady) && (
                                <label
                                    htmlFor={`video-upload-${block.id}`}
                                    className="flex items-center justify-center w-160 h-60 cursor-pointer border-2 border-dashed border-white/80 hover:border-white text-white/80 hover:text-white bg-transparent rounded-lg overflow-hidden"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10">
                                        <Upload className="h-8 w-8" />
                                        <span>Нажмите для загрузки видео</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                            e.target.files?.[0] &&
                                            handleFileUpload(e.target.files[0])
                                        }
                                        // disabled={isUploading}
                                        className="hidden"
                                        id={`video-upload-${block.id}`}
                                        ref={fileInputRef}
                                    />
                                </label>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

const CircularProgress = ({
    progress,
    className,
    onCancel,
}: {
    progress: number;
    className?: string;
    onCancel: () => void;
}) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg className={className} width="80" height="80" viewBox="0 0 80 80">
            <circle
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="6"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
            />
            <circle
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300 circular-spin-animation"
            />
            <foreignObject
                x="20"
                y="20"
                width="40"
                height="40"
                onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                }}
                className="cursor-pointer"
            >
                <div className="w-full h-full flex items-center justify-center rounded-full transition-colors">
                    <X className="text-white w-9 h-9 p-1" strokeWidth={3} />
                </div>
            </foreignObject>
        </svg>
    );
};

function TestBlock({
    block,
    dragAttributes,
    dragListeners,
    onDelete,
    onUpdate,
    isEditMode,
}: {
    block: Block;
    dragAttributes: any;
    dragListeners: any;
    onDelete: () => void;
    onUpdate: (payload: UpdateBlockRequest) => void;
    isEditMode: boolean;
}) {
    const [isBlockNameEditing, setIsBlockNameEditing] = useState(false);
    const [contentDisplayMode, setContentDisplayMode] =
        useState<TestContentProps["displayMode"]>(null);
    const [name, setName] = useState(block.name || "");
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isContentLoading, setIsContentLoading] = useState(false);

    const isContentEdit = contentDisplayMode === "edit";
    const isContentPass = contentDisplayMode === "pass";

    useEffect(() => {
        let isMounted = true;

        if (!isEditMode) {
            setIsLoading(true);
            getCurrentAttempt(block.id)
                .then(({ data }) => {
                    if (isMounted) {
                        setAttemptId(data.attempt.id);
                        setIsTestStarted(true);
                    }
                })
                .catch((_) => {
                    if (isMounted) {
                        setAttemptId(null);
                        setIsTestStarted(false);
                    }
                })
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [block.id, isEditMode]);

    useEffect(() => {
        setContentDisplayMode(null);
    }, [isEditMode]);

    const handleUpdateName = async () => {
        setIsBlockNameEditing(false);
        if (name.trim() !== block.name) {
            onUpdate({ id: block.id, name });
        }
    };

    const handleStartTest = () => {
        setIsContentLoading(true);
        startAttempt({ test_id: block.id })
            .then(({ data: { id } }) => {
                setAttemptId(id);
                setIsTestStarted(true);
                setContentDisplayMode("pass");
            })
            .finally(() => setIsContentLoading(false));
    };

    const handleFinishTest = async () => {
        setIsContentLoading(true);
        await finishAttempt({ id: attemptId! });
        setIsContentLoading(false);
        setIsTestStarted(false);
        handleViewAttempts();
    };

    const handleViewAttempts = async () => {
        if (contentDisplayMode === "view") {
            setContentDisplayMode(null);
            return;
        }
        try {
            setIsContentLoading(true);
            setContentDisplayMode("view");
            const { data } = await getFinishedAttempts(block.id);
            setAttempts(data.attempts);
            setIsContentLoading(false);
        } catch (error) {
            console.error("Failed to fetch attempts:", error);
            setAttempts([]);
        }
    };

    return (
        <div className="group relative">
            {isEditMode && (
                <div>
                    <button
                        className="absolute -left-8 top-[1rem] flex opacity-0 group-hover:opacity-100 hover:bg-cgray-600 p-1 rounded z-10"
                        {...dragAttributes}
                        {...dragListeners}
                    >
                        <GripVertical className="h-5 w-5 cursor-grab text-cgray-200" />
                    </button>

                    <div className="absolute -right-8 top-[1rem] flex opacity-0 group-hover:opacity-100 z-10">
                        <button
                            onClick={onDelete}
                            className="text-red-500 cursor-pointer hover:text-red-400 p-1"
                        >
                            <Trash size={20} />
                        </button>
                    </div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-cgray-700 rounded-lg p-4 flex flex-col items-left"
            >
                <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-2">
                        <SquareGanttChartIcon className="h-5 w-5 text-orange-600" />
                        {isBlockNameEditing ? (
                            <input
                                className="bg-transparent border-b border-gray-500 text-gray-100 focus:outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleUpdateName}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleUpdateName();
                                    if (e.key === "Escape") {
                                        setName(block.name || "");
                                        setIsBlockNameEditing(false);
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            <button
                                type="button"
                                className="text-gray-100 text-lg bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none"
                                style={{ textAlign: "left" }}
                                onClick={() =>
                                    isEditMode && setIsBlockNameEditing(true)
                                }
                                tabIndex={isEditMode ? 0 : -1}
                                disabled={!isEditMode}
                                aria-label="Редактировать название блока"
                            >
                                {block.name}
                            </button>
                        )}
                    </div>
                    {isEditMode ? (
                        <Button
                            variant={isContentEdit ? "light" : "ghost"}
                            className="flex items-center gap-1"
                            onClick={() =>
                                setContentDisplayMode(
                                    isContentEdit ? null : "edit"
                                )
                            }
                        >
                            {isContentEdit ? (
                                <>
                                    <Check size={16} /> Сохранить
                                </>
                            ) : (
                                <>
                                    <Pencil size={16} /> Редактировать
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => handleViewAttempts()}
                            >
                                Просмотр попыток
                            </Button>
                            {isLoading ? (
                                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                            ) : isTestStarted && !isContentPass ? (
                                <Button
                                    variant="light"
                                    onClick={() =>
                                        setContentDisplayMode("pass")
                                    }
                                >
                                    Продолжить тест
                                </Button>
                            ) : !isContentPass ? (
                                <Button
                                    variant="light"
                                    onClick={handleStartTest}
                                >
                                    Начать тест
                                </Button>
                            ) : (
                                <Button
                                    variant="light"
                                    onClick={handleFinishTest}
                                >
                                    Завершить тест
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                {contentDisplayMode && (
                    <TestContent
                        displayMode={contentDisplayMode}
                        testId={block.id}
                        testAttempts={attempts}
                        isLoading={isContentLoading}
                        setIsLoading={setIsContentLoading}
                    />
                )}
            </motion.div>
        </div>
    );
}
