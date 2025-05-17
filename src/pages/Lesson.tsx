import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLesson } from '@/hooks/useLesson';
import { useBlocks } from '@/hooks/useBlocks';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/UserMenu';
import useAccounts from '@/hooks/useAccounts';
import { useNavigate } from 'react-router-dom';
import { type Block } from '@/api/types';

export default function LessonPage() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const { courseId } = useParams<{ courseId: string }>();
    const numericLessonId = parseInt(lessonId || '0');
    const { user } = useAuth();
    const navigate = useNavigate();

    // Данные урока
    const { lesson, isLoading: isLoadingLesson, error: lessonError } = useLesson(numericLessonId);

    // Блоки урока
    const { blocks, isLoading: isLoadingBlocks, error: blocksError } = useBlocks(numericLessonId);

    // Аккаунты пользователя
    const { accounts } = useAccounts(user?.id || null);

    if (isLoadingLesson || isLoadingBlocks) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
                <header className="flex justify-between items-center px-8 py-6">
                    <Skeleton className="w-48 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-12 rounded-full" />
                </header>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-1/2 mb-8 rounded-xl" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (lessonError || blocksError) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <div className="text-red-400 text-xl text-center p-8">
                    {lessonError || blocksError}
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
                        ← Назад к курсу
                    </Button>
                    <h1 className="text-2xl font-bold">{lesson?.name}</h1>
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
                    {blocks?.map((block) => (
                        <BlockComponent key={block.id} block={block} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const BlockComponent = ({ block }: { block: Block }) => {
    return (
        <div className="bg-gray-800/30 rounded-lg p-6">
            {block.type === 'text' && (
                <div className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: block.content || '' }}
                />
            )}
            {block.type === 'video' && block.file_id && (
                <div className="rounded-lg overflow-hidden">
                    <video
                        src={`http://localhost:80/files/${block.file_id}`}
                        controls
                        className="w-100"
                    />
                </div>
            )}
        </div>
    );
};