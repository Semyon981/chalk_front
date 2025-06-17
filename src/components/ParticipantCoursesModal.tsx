import { useEffect, useState } from 'react';
import {
  enrollUser,
  unenrollUser,
} from '@/api/courses';
import { type Course } from '@/api/types';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { getAccountCourses, getMemberCourses } from '@/api/accounts';

interface ParticipantCoursesModalProps {
  isOpen: boolean;
  accountId: number;
  userId: number;
  userName: string;
  onClose: () => void;
}

export function ParticipantCoursesModal({
  isOpen,
  accountId,
  userId,
  userName,
  onClose
}: ParticipantCoursesModalProps) {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      getAccountCourses(accountId),
      getMemberCourses(accountId, userId)
    ]).then(([allResp, memberResp]) => {
      const all = allResp.data.courses;
      const enrolled = memberResp.data.courses;

      setAllCourses(all);
      setEnrolledCourses(enrolled);
      setAvailableCourses(all.filter(course => !enrolled.some(e => e.id === course.id)));
    });
  }, [isOpen, accountId, userId]);

  const handleEnroll = async () => {
    if (selectedCourseId === null) return;
    await enrollUser({ id: selectedCourseId, user_id: userId });

    const added = allCourses.find(c => c.id === selectedCourseId);
    if (!added) return;

    setEnrolledCourses(prev => [...prev, added]);
    setAvailableCourses(prev => prev.filter(c => c.id !== selectedCourseId));
    setSelectedCourseId(null);
  };

  const handleUnenroll = async (courseId: number) => {
    await unenrollUser({ id: courseId, user_id: userId });

    const removed = enrolledCourses.find(c => c.id === courseId);
    if (!removed) return;

    setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
    setAvailableCourses(prev => [...prev, removed]);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Курсы пользователя ${userName}`}>
      <div className="mb-4">
        <select
          className={`w-full p-2 bg-cgray-700 border rounded-md outline-none ${!selectedCourseId ? 'text-cgray-400' : 'text-cgray-100'
            }`}
          value={selectedCourseId ?? ''}
          onChange={e => setSelectedCourseId(Number(e.target.value))}
        >
          <option value="" disabled className="text-cgray-400">
            Выберите курс
          </option>
          {availableCourses.map(c => (
            <option
              key={c.id}
              value={c.id}
              className="bg-cgray-800 text-cgray-100"
            >
              {c.name}
            </option>
          ))}
        </select>
        <Button
          variant="light"
          size="sm"
          className="mt-2 w-full"
          onClick={handleEnroll}
          disabled={!selectedCourseId}
        >
          Записать пользователя
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {enrolledCourses.map(course => (
          <div
            key={course.id}
            className="flex justify-between items-center p-4 min-h-[80px] bg-cgray-700 rounded-lg transition-colors hover:bg-cgray-600"
          >
            <div className="text-cgray-100 font-medium overflow-hidden text-ellipsis">{course.name}</div>
            <button
              onClick={() => handleUnenroll(course.id)}
              className="text-red-400 hover:text-red-300 p-1 transition-colors"
              aria-label="Удалить с курса"
            >
              <TrashIcon size={18} />
            </button>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
