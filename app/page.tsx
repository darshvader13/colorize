'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                let img = reader.result.split(',')[1];
                setOriginalImage(img); // Save the original image in state
            } else {
                console.error('File could not be read as a string');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);  // Show the spinner
        setMessage('');

        const attempts = 20;
        for (let i = 1; i <= attempts; i++) {
            console.log('Attempting to upload image... Attempt', i, 'of', attempts);
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: originalImage }),
            });

            const result = await response.json();
            console.log(result);
            if (result.error) {
                if (i === attempts) {
                    setMessage(result.error);
                    break;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000 * i));
                }
            } else {
                setProcessedImage(result.output);
                setMessage('Image received and processed');
                break;
            }
        }

        setLoading(false);

        const response = await fetch('/api/stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const result = await response.json();
        console.log(result)
    };

    return (
        <div>
            <h1>Colorize Manga Panel</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <button type="submit" disabled={loading}>
                    {loading ? <LoadingSpinner /> : 'Upload'}
                </button>
            </form>
            {loading && <p>Loading...</p>}
            {message && <p>{message}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                {originalImage && (
                    <div>
                        <h2>Original Image:</h2>
                        <img src={`data:image/png;base64,${originalImage}`} alt="Original" style={{ maxWidth: '400px' }} />
                    </div>
                )}
                {processedImage && !loading && (
                    <div>
                        <h2>Colorized Image:</h2>
                        <img src={`data:image/png;base64,${processedImage}`} alt="Colorized" style={{ maxWidth: '400px' }} />
                    </div>
                )}
            </div>
        </div>
    );
}
