import { connectToDatabase } from '@/lib/db';
import { randomBytes } from 'crypto';

export const generateShortUrl = async (length = 6): Promise<string> => {
    const client = await connectToDatabase();
    let shortUrl: string;
    let existingUrl;

    try {
        do {
            // Generate a random string using crypto
            shortUrl = randomBytes(length)
                .toString('base64url') // Use base64url to ensure the string is URL-safe
                .substring(0, length);

            // Check if the generated short URL already exists in the database
            const query = 'SELECT short_url FROM urls WHERE short_url = $1';
            const values = [shortUrl];
            const result = await client.query(query, values);
            existingUrl = result.rows.length > 0;
        } while (existingUrl); // Repeat until a unique short URL is found

        return shortUrl;
    } finally {
        client.release();
    }
};


// import { connectToDatabase } from '@/lib/db';
// import { randomBytes } from 'crypto';

// export const generateShortUrl = async (length = 6): Promise<string> => {
//     const db = await connectToDatabase();
//     let shortUrl: string;
//     let existingUrl;

//     do {
//         // Generate a random string using crypto
//         shortUrl = randomBytes(length)
//             .toString('base64url') // Use base64url to ensure the string is URL-safe
//             .substring(0, length);

//         // Check if the generated short URL already exists in the database
//         existingUrl = await db.collection('urls').findOne({ short_url: shortUrl });
//     } while (existingUrl); // Repeat until a unique short URL is found

//     return shortUrl;
// };