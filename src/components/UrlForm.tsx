import { useState } from 'react';
import { motion } from 'framer-motion';
import { GiOrbDirection } from "react-icons/gi";

const UrlForm = ({ onShorten }: { onShorten: (shortUrl: string) => void }) => {
    const [originalUrl, setOriginalUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ originalUrl }),
            });

            if (response.ok) {
                const data = await response.json();
                onShorten(data.shortUrl);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative mt-4">
            <motion.div
                className="flex flex-row-reverse items-end border border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-3xl p-2 lg:w-1/2 mx-auto"
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.button
                    type="submit"
                    className=" hover:text-white p-2 hover:bg-black dark:bg-black/50 dark:hover:bg-white dark:hover:text-black rounded-3xl transition-all duration-300 ease-in-out"
                >
                    <GiOrbDirection size={25}/>
                </motion.button>
                <motion.textarea
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="Enter your URL here"
                    className="bg-transparent dark:bg-gray-800 dark:text-white rounded p-2 w-full resize-none overflow-y-auto outline-none"
                    style={{ maxHeight: '10rem' }}
                    required
                    aria-label="Original URL"
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 160)}px`; // Max height of 10rem
                    }}
                />
            </motion.div>
        </form>
    );
};

export default UrlForm;
