import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage, ServerResponse } from 'http';

// Type guard to check if res is NextApiResponse
function isNextApiResponse(res: any): res is NextApiResponse {
    return res && typeof (res as NextApiResponse).status === 'function';
}

export function runMiddleware(
    req: NextApiRequest | IncomingMessage,
    res: NextApiResponse | ServerResponse,
    fn: Function
): Promise<any> {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                if (isNextApiResponse(res)) {
                    res.status(403).json({ message: 'Not allowed by CORS' });
                } else {
                    res.statusCode = 403;
                    res.end('Not allowed by CORS');
                }
                return reject(result);
            }
            return resolve(result);
        });
    });
}
