import React from "react";

const Modal = ({ isOpen, title, onClose, children, footer, size = "sm" }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
    }[size];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 pointer-events-none"
        >
            {/* Modal Box */}
            <div
                className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses} mx-4 pointer-events-auto transform transition-all duration-300`}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto break-words max-h-[60vh]">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
