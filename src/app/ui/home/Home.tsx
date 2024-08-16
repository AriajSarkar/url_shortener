"use client";
import { useState, useEffect } from 'react';
import UrlForm from '@/components/UrlForm';
import ShortUrlDisplay from '@/components/ShortUrlDisplay';
import NavBar from '../nav/NavBar';
import { motion } from 'framer-motion';

const Home = () => {
    const [links, setLinks] = useState<{ shortUrl: string; expirationTime: string }[]>([]);

    // Function to calculate expiration time (24 hours later)
    const calculateExpirationTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 24); // Add 24 hours
        return now.toISOString(); // Store as ISO string
    };

    // Load the stored URLs from local storage on component mount
    useEffect(() => {
        const storedLinks = JSON.parse(localStorage.getItem('links') || '[]');
        const validLinks = storedLinks.filter(({ expirationTime }: { expirationTime: string }) =>
            new Date(expirationTime) > new Date()
        );
        setLinks(validLinks);
    }, []);

    // Handle the shortening of the URL
    const handleShorten = (url: string) => {
        const expirationTime = calculateExpirationTime();
        const newLink = { shortUrl: url, expirationTime };
        const updatedLinks = [...links, newLink].filter(({ expirationTime }: { expirationTime: string }) =>
            new Date(expirationTime) > new Date()
        );
        setLinks(updatedLinks);
        localStorage.setItem('links', JSON.stringify(updatedLinks));
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black">
            <NavBar />
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold mt-6 text-gray-900 dark:text-white">URL Shortener</h1>
                <UrlForm onShorten={handleShorten} />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4"
                >
                    <ShortUrlDisplay links={links} />
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
