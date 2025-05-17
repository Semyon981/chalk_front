import { motion } from 'framer-motion';

interface SkeletonProps {
    count?: number;
    className?: string;
}

export const Skeleton = ({ count = 1, className }: SkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
                    className={`bg-gray-700/30 animate-pulse ${className}`}
                />
            ))}
        </>
    );
};