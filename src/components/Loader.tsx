import { motion } from "framer-motion";

export const Loader = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    repeat: Infinity
                }}
                className="relative w-20 h-20"
            >
                <div className="absolute inset-0 border-4 border-gray-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-2 border-4 border-gray-300 rounded-full border-b-transparent animate-spin-reverse" />
            </motion.div>
        </div>
    );
};

export default Loader