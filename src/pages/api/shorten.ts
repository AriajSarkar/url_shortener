import validator from 'validator';
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/db';
import { generateShortUrl } from '@/lib/generateShortUrl';
import Cors from 'cors';

const allowedOrigins = (process.env.ALLOWED_ORIGIN || '').split(',');

// Initialize CORS middleware with configuration
const cors = Cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error('Internal Server Error'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// Helper function to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Run CORS middleware manually
        await runMiddleware(req, res, cors);

        // Handle preflight requests (OPTIONS)
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || ' ');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }

        const client = await connectToDatabase();

        if (req.method === 'POST') {
            const { originalUrl } = req.body;

            if (!originalUrl) {
                return res.status(400).json({ message: 'Original URL is required' });
            }

            if (!validator.isURL(originalUrl)) {
                return res.status(400).json({ message: 'Invalid original URL format' });
            }

            const shortUrl = await processUrl(originalUrl, client);
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            return res.status(201).json({ shortUrl: `${protocol}://${req.headers.host}/${shortUrl}` });

        } else if (req.method === 'GET') {
            const { shortUrl } = req.query;

            if (!shortUrl) {
                return res.status(400).json({ message: 'Short URL is required' });
            }

            if (!/^[a-zA-Z0-9_-]{6}$/.test(shortUrl as string)) {
                return res.status(400).json({ message: 'Invalid short URL format' });
            }

            const { originalUrl, isExpired } = await fetchOriginalUrl(shortUrl as string, client);
            if (isExpired) {
                return res.status(404).json({ message: 'URL not found or expired' });
            }

            return res.status(200).json({ original_url: originalUrl });

        } else {
            res.setHeader('Allow', ['POST', 'GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        // Type assertion to handle 'unknown' error
        if (error instanceof Error) {
            if (error.message.includes('Not allowed by CORS')) {
                return res.status(403).json({ message: 'CORS error: Origin not allowed' });
            }
            console.error('Error handling request:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        } else {
            // Handle non-Error cases
            console.error('Unexpected error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

async function processUrl(originalUrl: string, client: any): Promise<string> {
    await client.query('BEGIN');
    try {
        const checkQuery = 'SELECT short_url, created_at FROM urls WHERE original_url = $1';
        const checkValues = [originalUrl];
        const existingUrlResult = await client.query(checkQuery, checkValues);

        if (existingUrlResult.rows.length > 0) {
            const { short_url: shortUrl, created_at: createdAt } = existingUrlResult.rows[0];
            const expirationTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours

            if (new Date() > expirationTime) {
                // URL is expired, delete the record
                await client.query('DELETE FROM urls WHERE short_url = $1', [shortUrl]);
            } else {
                // Return existing short URL if not expired
                await client.query('COMMIT');
                return shortUrl;
            }
        }

        // Create a new short URL
        const shortUrl = await generateShortUrl();
        const insertQuery = 'INSERT INTO urls (original_url, short_url, created_at) VALUES ($1, $2, NOW())';
        const insertValues = [originalUrl, shortUrl];
        await client.query(insertQuery, insertValues);
        await client.query('COMMIT');
        return shortUrl;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing URL:', error);
        throw error;
    }
}

async function fetchOriginalUrl(shortUrl: string, client: any): Promise<{ originalUrl: string | null, isExpired: boolean }> {
    await client.query('BEGIN');
    try {
        const fetchQuery = `
            SELECT original_url, created_at FROM urls
            WHERE short_url = $1
            FOR UPDATE
        `;
        const fetchValues = [shortUrl];
        const urlDocResult = await client.query(fetchQuery, fetchValues);

        if (urlDocResult.rows.length === 0) {
            await client.query('COMMIT');
            return { originalUrl: null, isExpired: true }; // URL not found
        }

        const { original_url: originalUrl, created_at: createdAt } = urlDocResult.rows[0];
        const expirationTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours

        if (new Date() > expirationTime) {
            // URL expired, delete the record
            await client.query('DELETE FROM urls WHERE short_url = $1', [shortUrl]);
            await client.query('COMMIT');
            return { originalUrl: null, isExpired: true }; // URL expired and deleted
        }

        await client.query('COMMIT');
        return { originalUrl, isExpired: false };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error fetching URL:', error);
        throw error;
    }
}
