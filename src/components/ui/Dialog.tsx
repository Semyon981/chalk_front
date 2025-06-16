interface DialogProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Dialog({ isOpen, title, onClose, children }: DialogProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
                onClick={onClose} 
            />
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10 w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Close dialog"
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>
                
                <div className="text-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
}
