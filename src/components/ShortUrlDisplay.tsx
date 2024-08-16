"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ShortUrlDisplayProps {
    links: { shortUrl: string; expirationTime: string }[];
}

const ShortUrlDisplay: React.FC<ShortUrlDisplayProps> = ({ links }) => {
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const updatedTimeLeft: { [key: string]: number } = {};

            links.forEach(({ shortUrl, expirationTime }) => {
                const expirationDate = new Date(expirationTime);
                const timeDifference = expirationDate.getTime() - now.getTime();
                const seconds = Math.max(Math.floor(timeDifference / 1000), 0);
                updatedTimeLeft[shortUrl] = seconds;
            });

            setTimeLeft(updatedTimeLeft);
        };

        calculateTimeLeft(); // Initial calculation

        const intervalId = setInterval(() => {
            calculateTimeLeft();
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [links]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    // Remove duplicate URLs
    const uniqueLinks = Array.from(new Map(links.map(link => [link.shortUrl, link])).values());

    return (
        <div className="mt-4">
            {uniqueLinks.length > 0 ? (
                uniqueLinks.map(({ shortUrl, expirationTime }, index) => {
                    const secondsLeft = timeLeft[shortUrl] || 0; // Get remaining seconds

                    return (
                        <motion.div
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700 p-4 rounded rounded-tr-xl rounded-bl-xl shadow mb-2"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <p className="font-semibold text-gray-900 dark:text-white">Shortened URL:</p>
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                {shortUrl}
                            </a>
                            <div className="mt-2 text-gray-700 dark:text-gray-300">
                                {secondsLeft <= 0 ? (
                                    <p className="text-red-500">URL expired</p>
                                ) : (
                                    <p>Expires in: {formatTime(secondsLeft)}</p>
                                )}
                            </div>
                            <div className="mt-2 text-gray-700 dark:text-gray-300">
                                <p className="font-semibold text-gray-900 dark:text-white">Original Expiration Time:</p>
                                <p>{new Date(expirationTime).toLocaleString()}</p>
                            </div>
                        </motion.div>
                    );
                })
            ) : (
                <p className="text-gray-700 dark:text-gray-300">No links available</p>
            )}
        </div>
    );
};

export default ShortUrlDisplay;
