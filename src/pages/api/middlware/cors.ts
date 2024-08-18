import Cors from 'cors';

// Define allowed origins directly
const allowedOrigins = [
    'https://dexyscraft.link',
    'https://www.dexyscraft.link',
    'http://localhost:3000'
];

console.log('Allowed Origins:', allowedOrigins); // Log allowed origins

// Initialize CORS middleware
const cors = Cors({
    origin: (origin, callback) => {
        console.log('Incoming Origin:', origin); // Log incoming origin

        if (!origin) {
            // Allow requests with no origin (like mobile apps or curl requests)
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            // Allow specified origins
            return callback(null, true);
        } else {
            // Deny other origins
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Enable cookies and other credentials
    optionsSuccessStatus: 204,
});

export default cors;
