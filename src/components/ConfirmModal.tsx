import { Button } from '@/components/ui/Button';
import { ChevronLeft, GripVertical, X, Edit, Check, Trash, Pencil, ArrowLeft, Users, UserRoundPlus } from 'lucide-react';


interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title = 'Подтвердить действие',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Да',
  cancelText = 'Нет',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-cgray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>


          <button
            onClick={onCancel}
            className="text-cgray-100 text-4xl hover:text-cgray-200 cursor-pointer"
            aria-label="Закрыть"
          >
            <X size={25} />
          </button>
        </div>

        <p className="mb-6">{message}</p>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="light" onClick={onConfirm} style={{ paddingInline: '20px' }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}