import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.locale('ru');

interface ElapsedTimerProps {
    utcTime: string; // формат ISO-8601, например: '2025-06-19T09:00:00Z'
}

const ElapsedTimer: React.FC<ElapsedTimerProps> = ({ utcTime }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const updateElapsed = () => {
            const now = dayjs.utc();
            const then = dayjs.utc(utcTime);
            const diffSeconds = now.diff(then, 'second');

            const dur = dayjs.duration(diffSeconds, 'seconds');
            const hours = dur.hours();
            const minutes = dur.minutes();
            const seconds = dur.seconds();

            let formatted = '';
            if (hours > 0) {
                formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else if (minutes > 0) {
                formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                formatted = `${String(seconds).padStart(2, '0')}`;
            }

            setElapsed(formatted);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);
        return () => clearInterval(interval);
    }, [utcTime]);

    return <span>{elapsed}</span>;
};

export default ElapsedTimer;