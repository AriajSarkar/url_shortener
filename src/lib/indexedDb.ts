export interface UrlData {
    shortUrl: string;
    expirationTime: string;
}

export const openDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('urlShortenerDB', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('urls')) {
                db.createObjectStore('urls', { keyPath: 'shortUrl' });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const storeUrlData = async (data: UrlData[]): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('urls', 'readwrite');
        const store = transaction.objectStore('urls');

        data.forEach(({ shortUrl, expirationTime }) => {
            store.put({ shortUrl, expirationTime });
        });

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};

export const fetchUrlData = async (): Promise<UrlData[]> => {
    const db = await openDb();
    return new Promise<UrlData[]>((resolve, reject) => {
        const transaction = db.transaction('urls', 'readonly');
        const store = transaction.objectStore('urls');
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result as UrlData[]);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};
