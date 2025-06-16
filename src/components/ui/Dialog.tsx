interface DialogProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Dialog({ isOpen, title, onClose, children }: DialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Оверлей с размытием */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Контейнер диалога */}
            <div className="bg-cgray-800 rounded-lg p-6 w-full max-w-md z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-cgray-100 hover:text-cgray-200 text-2xl transition-colors"
                        aria-label="Close dialog"
                    >
                        ×
                    </button>
                </div>

                {/* Дочерний контент без дополнительной обертки */}
                {children}
            </div>
        </div>
    );
}