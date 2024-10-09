"use client"
import StreamView from '@/app/components/StreamView'

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
  const creatorId = "6233674c-4b4d-46c9-bd8e-5e3d4b2b7201"
  return (
    <>
      <StreamView creatorId={creatorId} playVideo={true}/>
    </>
  )
}