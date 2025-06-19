import {
    createTestAnswer,
    createTestQuestion,
    getCurrentAttempt,
    getTestInfo,
    removeTestAnswer,
    removeTestQuestion,
    setAnswerSelection,
    updateTestAnswer,
    updateTestQuestion,
} from "@/api/tests";
import type { Attempt, TestQuestion, TestQuestionAnswer } from "@/api/types";
import { formatRussianDateTime } from "@/lib/utils";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    Plus,
    Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import ElapsedTimer from "./ui/ElapsedTimer";
import { data } from "react-router-dom";

export interface TestContentProps {
    testId: number;
    displayMode: "view" | "edit" | "pass" | null;
    testAttempts?: Attempt[];
    isLoading?: boolean;
    setIsLoading?: (loading: boolean) => void;
}

const TestContent: React.FC<TestContentProps> = ({
    testId,
    displayMode,
    testAttempts = [],
    isLoading = false,
    setIsLoading = () => { },
}) => {
    const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [editingQuestion, setEditingQuestion] = useState("");
    const [editingAnswers, setEditingAnswers] = useState<
        Record<number, string>
    >({});
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<number, number[]>
    >({});
    const [attemptId, setAttemptId] = useState(0);

    const [currentPassStartedAt, setCurrentPassStartedAt] = useState("");


    const currentQuestion = testQuestions[currentIndex];
    const currentAttempt = testAttempts[attemptId];
    const points = currentAttempt?.points ?? 0;
    const progressColor =
        points >= 0.8
            ? "bg-green-500"
            : points >= 0.5
                ? "bg-yellow-500"
                : "bg-red-500";

    // Эффект 1: Загрузка данных для режима прохождения теста
    useEffect(() => {
        if (displayMode === "pass") {
            setIsLoading(true);
            getCurrentAttempt(testId)
                .then(
                    ({
                        data: {
                            attempt: { started_at, questions },
                        },
                    }) => {
                        setCurrentPassStartedAt(started_at)
                        setTestQuestions(questions);
                        const initialSelections: Record<number, number[]> = {};
                        for (const question of questions) {
                            initialSelections[question.id] = question.answers
                                .filter((a) => a.is_selected)
                                .map((a) => a.id);
                        }
                        setSelectedAnswers(initialSelections);
                    }
                )
                .finally(() => setIsLoading(false));
        }
    }, [testId, displayMode]);

    // Эффект 2: Обработка изменений попыток в режиме просмотра
    useEffect(() => {
        if (displayMode === "view" && testAttempts.length > 0) {
            setIsLoading(true);
            try {
                setTestQuestions(testAttempts[attemptId].questions);
            } finally {
                setIsLoading(false);
            }
        }
    }, [displayMode, attemptId, testAttempts]);

    // Эффект 3: Загрузка данных теста для других режимов
    useEffect(() => {
        if (displayMode === "edit") {
            setIsLoading(true);
            getTestInfo(testId)
                .then((res) => setTestQuestions(res.data.test.questions))
                .finally(() => setIsLoading(false));
        }
    }, [testId, displayMode, testAttempts]);

    useEffect(() => {
        if (currentQuestion && displayMode === "edit") {
            setEditingQuestion(currentQuestion.question);
        }
    }, [currentQuestion, displayMode]);

    // Эффект 4: Сброс состояния при смене режима отображения
    useEffect(() => {
        setCurrentIndex(0);
    }, [displayMode]);

    const handleAttemptChange = (
        direction: "prev" | "next" | "first" | "last"
    ) => {
        if (direction === "prev" && attemptId > 0) {
            setAttemptId(attemptId - 1);
        } else if (
            direction === "next" &&
            attemptId < testAttempts.length - 1
        ) {
            setAttemptId(attemptId + 1);
        } else if (direction === "first") {
            setAttemptId(0);
        } else if (direction === "last") {
            setAttemptId(testAttempts.length - 1);
        }
    };

    // Эффект 5: Уставновка последней попытки при просмотре попыток
    useEffect(() => {
        if (displayMode === "view" && testAttempts.length > 0) {
            setAttemptId(testAttempts.length - 1);
        }
    }, [displayMode, testAttempts]);

    const addQuestion = async () => {
        const res = await createTestQuestion({
            test_id: testId,
            question: "Новый вопрос",
        });
        const newQuestion: TestQuestion = {
            id: res.data.id,
            question: "Новый вопрос",
            answers: [],
        };
        setTestQuestions((prev) => [...prev, newQuestion]);
        setCurrentIndex(testQuestions.length);
    };

    const updateQuestion = async (text: string) => {
        if (!currentQuestion) return;
        await updateTestQuestion({ id: currentQuestion.id, question: text });
        setTestQuestions((prev) =>
            prev.map((q) =>
                q.id === currentQuestion.id ? { ...q, question: text } : q
            )
        );
    };

    const addAnswer = async () => {
        const res = await createTestAnswer({
            question_id: currentQuestion.id,
            answer: "Ответ",
            is_correct: false,
        });
        setTestQuestions((prev) =>
            prev.map((q) =>
                q.id === currentQuestion.id
                    ? {
                        ...q,
                        answers: [
                            ...q.answers,
                            {
                                id: res.data.id,
                                answer: "",
                                is_correct: false,
                            },
                        ],
                    }
                    : q
            )
        );
    };

    const updateAnswer = async (
        id: number,
        changes: Partial<TestQuestionAnswer>
    ) => {
        setTestQuestions((prev) =>
            prev.map((q) =>
                q.id === currentQuestion.id
                    ? {
                        ...q,
                        answers: q.answers.map((a) =>
                            a.id === id ? { ...a, ...changes } : a
                        ),
                    }
                    : q
            )
        );
        await updateTestAnswer({ id, ...changes });
    };

    const removeAnswer = async (id: number) => {
        await removeTestAnswer(id);
        setTestQuestions((prev) =>
            prev.map((q) =>
                q.id === currentQuestion.id
                    ? { ...q, answers: q.answers.filter((a) => a.id !== id) }
                    : q
            )
        );
    };

    const removeQuestion = async (id: number) => {
        await removeTestQuestion(id);
        const filtered = testQuestions.filter((q) => q.id !== id);
        setTestQuestions(filtered);
        setCurrentIndex(
            filtered.length === 0
                ? 0
                : Math.min(currentIndex, filtered.length - 1)
        );
    };

    const handleAnswerSelect = async (questionId: number, answerId: number) => {
        const current = selectedAnswers[questionId] || [];
        const isSelected = current.includes(answerId);

        const newSelected = isSelected
            ? current.filter((id) => id !== answerId)
            : [...current, answerId];

        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: newSelected,
        }));

        await setAnswerSelection({
            attempt_answer_id: answerId,
            is_selected: !isSelected,
        });
    };

    const handleNextClick = () => {
        if (currentIndex === testQuestions.length - 1) {
            if (displayMode === "edit") {
                // Добавление вопроса
                addQuestion();
            }
        } else {
            setCurrentIndex((i) => i + 1);
        }
    };


    const isEdit = displayMode === "edit";
    const isPass = displayMode === "pass";
    const isView = displayMode === "view";

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="border-cgray-600 pt-4 flex flex-col space-y-4 mb-4">
            <>
                {isView && !!testAttempts.length && (

                    // Блок попыток и прогресса
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* К началу */}
                            <button
                                onClick={() => handleAttemptChange("first")}
                                disabled={attemptId === 0}
                                className={`transition-transform duration-150 ${attemptId === 0
                                    ? "opacity-50 cursor-default"
                                    : "text-white hover:scale-125"
                                    }`}
                            >
                                <ChevronsLeft size={20} />
                            </button>

                            {/* Назад */}
                            <button
                                onClick={() => handleAttemptChange("prev")}
                                disabled={attemptId === 0}
                                className={`transition-transform duration-150 ${attemptId === 0
                                    ? "opacity-50 cursor-default"
                                    : "text-white hover:scale-125"
                                    }`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {/* Индикатор */}
                            <span className="font-medium">
                                Попытка {attemptId + 1} из{" "}
                                {testAttempts.length}
                            </span>

                            {/* Вперёд */}
                            <button
                                onClick={() => handleAttemptChange("next")}
                                disabled={
                                    attemptId === testAttempts.length - 1
                                }
                                className={`transition-transform duration-150 ${attemptId === testAttempts.length - 1
                                    ? "opacity-50 cursor-default"
                                    : "text-white hover:scale-125"
                                    }`}
                            >
                                <ChevronRight size={20} />
                            </button>

                            {/* К концу */}
                            <button
                                onClick={() => handleAttemptChange("last")}
                                disabled={
                                    attemptId === testAttempts.length - 1
                                }
                                className={`transition-transform duration-150 ${attemptId === testAttempts.length - 1
                                    ? "opacity-50 cursor-default"
                                    : "text-white hover:scale-125"
                                    }`}
                            >
                                <ChevronsRight size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Блок с датами */}
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-cgray-50">
                                    {formatRussianDateTime(currentAttempt?.started_at)} - {formatRussianDateTime(currentAttempt?.started_at)}
                                </span>
                            </div>
                            <div className="flex flex-col items-center relative pr-4">
                                <div className="w-40 bg-cgray-400 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${progressColor}`}
                                        style={{
                                            width: `${(points ?? 0) * 100}%`,
                                        }}
                                    />
                                </div>
                                {/*
                                            Вычисляем позицию индикатора результата для наглядности
                                            */}
                                {(() => {
                                    const percent = points * 100 || 12;
                                    const offset = points * 10 + 20;
                                    const leftStyle = `calc(${percent}% - ${offset}px)`;
                                    return (
                                        <span
                                            className="text-xs mt-1 absolute top-2 transition-[left]"
                                            style={{ left: leftStyle }}
                                        >
                                            {(points * 100).toFixed(1)}%
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
                {!testQuestions.length ? (
                    isEdit ? (
                        <button
                            onClick={addQuestion}
                            className="w-8 h-8 flex items-center justify-center text-white cursor-pointer hover:scale-125"
                        >
                            <Plus size={20} />
                        </button>
                    ) : (
                        <p>Здесь пока пусто</p>
                    )) : !(isView && !testAttempts.length) && (
                        <>
                            {/* Навигация по вопросам */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex gap-2">
                                    {testQuestions.map((q, index) => {
                                        // Логика для режима view
                                        if (isView) {
                                            const allAnswers = q.answers;
                                            const correctAnswers = allAnswers.filter(
                                                (a) => a.is_correct
                                            );
                                            const selectedCorrect = allAnswers.filter(
                                                (a) => a.is_selected && a.is_correct
                                            );
                                            const selectedIncorrect = allAnswers.filter(
                                                (a) => a.is_selected && !a.is_correct
                                            );

                                            let dotColor = "";
                                            if (currentIndex === index) {
                                                dotColor = "bg-blue-500"; // Текущий вопрос
                                            } else if (
                                                selectedIncorrect.length > 0 &&
                                                selectedCorrect.length === 0
                                            ) {
                                                dotColor = "bg-red-500"; // Все ответы неправильные
                                            } else if (
                                                selectedCorrect.length ===
                                                correctAnswers.length &&
                                                selectedIncorrect.length === 0
                                            ) {
                                                dotColor = "bg-green-500"; // Все ответы правильные
                                            } else if (
                                                selectedCorrect.length > 0 ||
                                                selectedIncorrect.length > 0
                                            ) {
                                                dotColor = "bg-yellow-500"; // Некоторые ответы правильные
                                            } else {
                                                dotColor = "bg-cgray-500"; // Ответы не выбраны
                                            }

                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() =>
                                                        setCurrentIndex(index)
                                                    }
                                                    className={`border border-transparent ${currentIndex === index ? "cursor-default" : "cursor-pointer"} px-5 py-[5px] rounded-full text-sm font-medium hover:border-blue-500 transition-colors ${dotColor} text-white`}
                                                />
                                            );
                                        }

                                        // Логика для режима pass
                                        if (isPass) {
                                            const hasSelected =
                                                selectedAnswers[q.id]?.length > 0;

                                            const dotColor =
                                                currentIndex === index
                                                    ? "bg-blue-500"
                                                    : hasSelected
                                                        ? "bg-white"
                                                        : "bg-cgray-500";

                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() =>
                                                        setCurrentIndex(index)
                                                    }
                                                    className={`border border-transparent px-5 py-[5px] ${currentIndex === index ? "cursor-default" : "cursor-pointer"} rounded-full text-sm font-medium hover:border-blue-500 transition-colors ${dotColor} ${dotColor === "bg-white"
                                                        ? "text-gray-800"
                                                        : "text-white"
                                                        }`}
                                                />
                                            );
                                        }

                                        // Логика для других режимов (edit)
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentIndex(index)}
                                                className={`border border-transparent px-5 py-[5px] rounded-full text-sm font-medium transition-colors ${currentIndex === index
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-cgray-500 text-gray-300 hover:bg-cgray-400 cursor-pointer hover:border-blue-500"
                                                    }`}
                                            />
                                        );
                                    })}
                                </div>
                                {isEdit && (
                                    <button
                                        onClick={addQuestion}
                                        className="w-8 h-8 flex items-center justify-center text-white cursor-pointer hover:scale-125"
                                    >
                                        <Plus size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Заголовок вопроса */}
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2 mb-0 grow">
                                    {isEdit && (
                                        <button
                                            onClick={() =>
                                                removeQuestion(currentQuestion.id)
                                            }
                                            className="text-red-500 cursor-pointer hover:text-red-400 p-1"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    )}

                                    <p className="text-gray-100 text-2xl">
                                        {currentIndex + 1}.
                                    </p>

                                    {isEdit ? (
                                        <input
                                            className="w-full text-2xl bg-transparent border-cgray-500 focus:outline-none text-gray-100"
                                            value={editingQuestion}
                                            onChange={(e) =>
                                                setEditingQuestion(e.target.value)
                                            }
                                            onBlur={() => {
                                                if (
                                                    editingQuestion !==
                                                    currentQuestion.question
                                                ) {
                                                    updateQuestion(editingQuestion);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-100 text-2xl">
                                            {currentQuestion.question}
                                        </p>
                                    )}
                                </div>

                                {isPass && (
                                    <div className="flex items-center mr-2">
                                        <ElapsedTimer utcTime={currentPassStartedAt} />
                                    </div>
                                )}


                                {/* Стрелочки */}
                                <div className="flex justify-end gap-4">
                                    <button
                                        disabled={currentIndex === 0}
                                        onClick={() => setCurrentIndex((i) => i - 1)}
                                        className={`transition-transform duration-150 ${currentIndex === 0
                                            ? "opacity-50 cursor-default"
                                            : "text-white hover:scale-125"
                                            }`}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <button
                                        disabled={
                                            currentIndex === testQuestions.length - 1
                                        }
                                        onClick={handleNextClick}
                                        className={`transition-transform duration-150 text-white ${currentIndex === testQuestions.length - 1
                                            ? "opacity-50 cursor-default"
                                            : "hover:scale-125"
                                            }`}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Ответы */}
                            <div className="space-y-2">
                                {currentQuestion.answers.map((a) => (
                                    <div key={a.id} className="flex items-center gap-2">
                                        {isEdit ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        updateAnswer(a.id, {
                                                            is_correct: !a.is_correct,
                                                        })
                                                    }
                                                    className={`w-6 h-6 flex items-center cursor-pointer justify-center border rounded-sm transition duration-150 ${a.is_correct
                                                        ? "bg-green-500 border-green-500"
                                                        : "bg-cgray-500 border-cgray-400"
                                                        }`}
                                                >
                                                    {a.is_correct && (
                                                        <Check
                                                            className="text-white"
                                                            size={16}
                                                        />
                                                    )}
                                                </button>

                                                <input
                                                    className="flex-1 bg-cgray-800 p-2 rounded outline-0 text-gray-100"
                                                    value={
                                                        editingAnswers[a.id] ?? a.answer
                                                    }
                                                    onChange={(e) =>
                                                        setEditingAnswers((prev) => ({
                                                            ...prev,
                                                            [a.id]: e.target.value,
                                                        }))
                                                    }
                                                    onBlur={() => {
                                                        const edited = (
                                                            editingAnswers[a.id] ?? ""
                                                        ).trim();
                                                        const original = (
                                                            a.answer ?? ""
                                                        ).trim();
                                                        if (edited !== original) {
                                                            updateAnswer(a.id, {
                                                                answer: edited,
                                                            });
                                                        }
                                                    }}
                                                />

                                                <button
                                                    onClick={() => removeAnswer(a.id)}
                                                    className="text-red-500 cursor-pointer hover:text-red-400 p-1"
                                                >
                                                    <Trash size={20} />
                                                </button>
                                            </>
                                        ) : isPass ? (
                                            <button
                                                onClick={() =>
                                                    handleAnswerSelect(
                                                        currentQuestion.id,
                                                        a.id
                                                    )
                                                }
                                                className={`w-full text-left p-2 rounded border cursor-pointer transition ${selectedAnswers[
                                                    currentQuestion.id
                                                ]?.includes(a.id)
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "bg-cgray-700 text-gray-200 border-cgray-500"
                                                    }`}
                                            >
                                                {a.answer}
                                            </button>
                                        ) : (
                                            <div
                                                className={`w-full p-2 rounded border ${a.is_selected
                                                    ? "border-blue-500"
                                                    : "border-cgray-500"
                                                    } ${a.is_correct
                                                        ? "bg-green-500/20"
                                                        : a.is_selected
                                                            ? "bg-red-500/20"
                                                            : ""
                                                    }`}
                                            >
                                                {a.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isEdit && (
                                    <div className="relative h-5">
                                        <div
                                            className="absolute inset-0 flex items-center justify-center opacity-100 animate-pulse cursor-pointer"
                                            onClick={addAnswer}
                                        >
                                            <div className="flex-1 h-0.5 bg-white rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                }
            </>
        </div>
    )
};

export default TestContent;
