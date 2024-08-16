import { useEffect } from 'react';
import { useParams } from 'next/navigation';

const ShortUrlPage = () => {
  const params = useParams();

  // Type assertion to ensure `shortUrl` is treated as a string
  const shortUrl = params?.shortUrl as string;

  useEffect(() => {
    if (!shortUrl) return;

    const fetchUrl = async () => {
      const response = await fetch(`/api/shorten?shortUrl=${shortUrl}`);
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.original_url;
      } else {
        console.error('Error fetching original URL');
      }
    };

    fetchUrl();
  }, [shortUrl]);

  return <div>Redirecting...</div>;
};

export default ShortUrlPage;
