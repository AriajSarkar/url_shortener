"use client";
import { useEffect, useState } from 'react';
import { IoSunny, IoMoonOutline } from "react-icons/io5";
import { motion } from 'framer-motion';

const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const currentTheme = localStorage.getItem('theme');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const themeToSet = currentTheme === 'dark' ? true : currentTheme === 'light' ? false : prefersDarkMode;
        setIsDarkMode(themeToSet);
        document.documentElement.classList.toggle('dark', themeToSet);
    }, []);

    const toggleDarkMode = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsDarkMode(prev => {
                const newTheme = !prev ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
                document.documentElement.classList.toggle('dark', newTheme === 'dark');
                return newTheme === 'dark';
            });
            setIsAnimating(false);
        }, 800); // Match timeout to animation duration
    };

    if (isDarkMode === null) return null;

    // Define a custom transition for reuse
    const transition = { duration: 0.5, ease: "easeInOut" };

    return (
        <div className="relative flex items-center">
            <motion.div
                className="absolute inset-0 bg-gray-300 dark:bg-yellow-200/50 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: isDarkMode ? 1 : 0 }}
                transition={transition}
            />
            <button onClick={toggleDarkMode} className="p-2 rounded focus:outline-none relative z-10">
                <motion.div
                    animate={{ rotate: isDarkMode ? 360 : 0 }} // Spin animation
                    transition={{ duration: 0.5 }}
                >
                    {isDarkMode ? (
                        <IoSunny size={20} className="text-yellow-300 contrast-150" />
                    ) : (
                        <IoMoonOutline size={20} className='text-gray-900 dark:text-white'/>
                    )}
                </motion.div>
            </button>
            {isAnimating && (
                <motion.div
                    className={`fixed inset-0 z-0 transition duration-700 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-white'} blur-3xl`}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <filter id="blurFilter">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                            </filter>
                        </defs>
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="120%"
                            fill={isDarkMode ? '#1F2937' : '#f3f4f6'}
                            filter="url(#blurFilter)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={transition} // Use the same transition
                        />
                    </svg>
                </motion.div>
            )}
        </div>
    );
};

export default DarkModeToggle;
