import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoAlertCircleOutline,
    IoCheckmarkCircleOutline,
    IoWarningOutline,
    IoCloseOutline
} from 'react-icons/io5';

const GlobalAlert = () => {
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const handleGlobalAlert = (event) => {
            const { message, type = 'error', duration = 6000 } = event.detail;
            setAlert({ message, type, id: Date.now() });

            if (duration !== -1) {
                setTimeout(() => {
                    setAlert(prev => prev && prev.id === event.detail.id ? null : prev);
                }, duration);
            }
        };

        window.addEventListener('global-alert', handleGlobalAlert);
        return () => window.removeEventListener('global-alert', handleGlobalAlert);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />;
            case 'warning': return <IoWarningOutline className="w-6 h-6 text-orange-500" />;
            default: return <IoAlertCircleOutline className="w-6 h-6 text-red-500" />;
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800 shadow-green-100';
            case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800 shadow-orange-100';
            default: return 'bg-red-50 border-red-200 text-red-800 shadow-red-100';
        }
    };

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border-2 shadow-xl ${getTypeStyles(alert.type)}`}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon(alert.type)}
                        </div>
                        <div className="flex-1 text-sm font-semibold leading-relaxed">
                            {alert.message}
                        </div>
                        <button
                            onClick={() => setAlert(null)}
                            className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <IoCloseOutline className="w-5 h-5 opacity-60" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalAlert;
