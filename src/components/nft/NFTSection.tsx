import { useState, ReactNode } from 'react';

type Props = {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string; // Allow extra styling
};

export default function NFTSection({ title, icon, children, defaultOpen = false, className = "" }: Props) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`bg-[#1e1f26] border border-gray-700 rounded-xl overflow-hidden ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-3 font-bold text-gray-200">
                    {icon}
                    <span>{title}</span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="border-t border-gray-700/50">
                    {children}
                </div>
            )}
        </div>
    );
}
