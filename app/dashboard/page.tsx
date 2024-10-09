"use client"
import StreamView from '@/app/components/StreamView'
import { useEffect, useState } from 'react';

// Mock function to extract video ID from URL
const getVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface Video {
  streamId: string;
  id: string;
  title: string;
  upvotes: number;
  haveUpVoted: boolean;
}

export default function Component() {
  const [creatorId, setCreatorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch("/api/user");
                const data = await response.json();
                setCreatorId(data.user.id);
            } catch (e) {
                console.error("Error fetching user data:", e);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!creatorId) {
        return <div>Error: Unable to load user data</div>;
    }

    return <StreamView creatorId={creatorId} playVideo={true} />;
}