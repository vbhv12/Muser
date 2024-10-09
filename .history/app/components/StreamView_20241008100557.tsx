"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Play, Share, LogIn, LogOut, Image } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from 'axios'
import { useSession, signIn, signOut } from 'next-auth/react'

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

export default function StreamView({
    creatorId,
    playVideo = false
}:{
    creatorId: string
    playVideo: boolean
}) {
  const { data: session, status } = useSession();
  const { toast } = useToast()

  const [inputUrl, setInputUrl] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [playedVideos, setPlayedVideos] = useState<Set<string>>(new Set())
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)

  const REFRESH_INTERVAL = 1000 * 10;

  const addToQueue = async () => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add videos to the queue.",
      })
      return;
    }

    const videoId = getVideoId(inputUrl)

    if (videoId && !playedVideos.has(videoId)) {
      const addedVideo = await axios.post("/api/streams", {
        creatorId: session.user.id,
        url: inputUrl
      })

      const newVideo = { streamId: addedVideo.data.id, id: videoId, title: `Video ${videoId}`, upvotes: 0, haveUpVoted: false }
      setQueue(prevQueue => {
        const updatedQueue = [...prevQueue, newVideo].sort((a, b) => b.upvotes - a.upvotes);
        // playNext();
        // updateCurrentVideo(newVideo);
        return updatedQueue;
      })
      setInputUrl('')
      setPreviewVideo(null)
      toast({
        variant: "black",
        title: "Video Added",
        description: "The video has been added to the queue.",
      })
    }
  }

  const vote = (streamId: string, videoId: string, amount: number, haveUpVoted: boolean) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to vote.",
      })
      return;
    }
    
    setQueue(prevQueue => {
      const updatedQueue = prevQueue.map(video => 
        video.id === videoId ? { ...video, upvotes: haveUpVoted ? video.upvotes - amount : video.upvotes + amount, haveUpVoted: !video.haveUpVoted } : video
      ).sort((a, b) => b.upvotes - a.upvotes);

      // if(updatedQueue.length > 0)
        // updateCurrentVideo(updatedQueue[0]);
      return updatedQueue;
    })

    fetch(`/api/streams/${haveUpVoted ? "downvotes" : "upvotes"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: streamId
      })
    })
  }

  const updateCurrentVideo = (activeVideo: Video | null) => {
    setCurrentVideo(activeVideo);
  }

  const playNext = async() => {
    if (currentVideo) {
      setPlayedVideos(prev => new Set(prev).add(currentVideo.id))
    }
    try {
      const data = await axios.get(`/api/streams/nextSong`);
      console.log(data);
      const activeVideo = data.data.stream;
      console.log("Next video data:", activeVideo);
  
      if (activeVideo && activeVideo.id) {
        const nextVideo: Video = {
          streamId: activeVideo.id,
          id: activeVideo.extractedId,
          title: activeVideo.title,
          upvotes: activeVideo.upvotes,
          haveUpVoted: activeVideo.haveUpVoted,
        };
        console.log("Formatted next video:", nextVideo);
  
        setCurrentVideo(nextVideo);
        setQueue(prevQueue => prevQueue.filter(video => video.streamId !== nextVideo.streamId));
        
        toast({
          variant: "black",
          title: "Next Video",
          description: `Now playing: ${nextVideo.title}`,
        });
      } else {
        setCurrentVideo(null);
        toast({
          title: "Queue Empty",
          description: "There are no more videos in the queue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching next song:", error);
      toast({
        title: "Error",
        description: "Failed to load the next video.",
        variant: "destructive",
      });
    }
  }

  const shareQueue = () => {
    const shareableLink = `${window.location.hostname}/creator/${creatorId}`
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        variant: "black",
        title: "Link Copied",
        description: "Link Copied to clipboard",
      })
    }, () => {
      toast({
        title: "Link Copy Failed",
        description: "Failed to copy the link to clipboard.",
        variant: "destructive",
      })
    });
  }
  
  async function refreshStreams() {
    const res = await axios.get(`/api/streams/?creatorId=${creatorId}`);
    const allVideos = res.data.streams;
    const activeVideo = res.data.activeStream;
  
    if (activeVideo) {
      const currentVideo: Video = {
        streamId: activeVideo.id,
        id: activeVideo.extractedId,
        title: activeVideo.title,
        upvotes: activeVideo.upvotes,
        haveUpVoted: activeVideo.haveUpVoted,
      };
      setCurrentVideo(currentVideo);

      
      
      // Remove the current video from the queue if it's there
      setQueue(prevQueue => prevQueue.filter(video => video.streamId !== currentVideo.streamId));
      
      toast({
        variant: "black",
        title: "Now Playing",
        description: `Currently playing: ${currentVideo.title}`,
      });
    } else {
      setCurrentVideo(null);
    }
  
    const transformedVideos: Video[] = allVideos
      .filter((video: any) => !playedVideos.has(video.extractedId) && video.id !== activeVideo?.id)
      .map((video: any) => ({
        streamId: video.id,
        id: video.extractedId,
        title: video.title,
        upvotes: video.upvotes,
        haveUpVoted: video.haveUpVoted,
      }))
      .sort((a: Video, b: Video) => b.upvotes - a.upvotes);
  
    setQueue(transformedVideos);
  }

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL)
  
    return () => clearInterval(interval);
  }, [creatorId])

  // useEffect(() => {
  //   if (!currentVideo && queue.length > 0) {
  //     playNext()
  //   }
  // },[])

  const currentVideoRender = (video: Video, isCurrentlyPlaying: boolean) => (
    <Card key={video.id} className="bg-gray-800">
      <CardContent className="p-4 flex flex-col space-y-4">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.id}${isCurrentlyPlaying ? '?autoplay=1' : ''}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          ></iframe>
        </div>
      </CardContent>
    </Card>
  )

  const renderVideoCard = (video: Video, isCurrentlyPlaying: boolean) => (
    <Card key={video.id} className="bg-gray-800">
      <CardContent className="p-4 flex flex-col space-y-4">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.id}${isCurrentlyPlaying ? '?autoplay=1' : ''}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          ></iframe>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-200">{video.title}</h3>
            <p className="text-gray-300">Votes: {video.upvotes || 0}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button size="sm" onClick={() => vote(video.streamId, video.id, 1, video.haveUpVoted)}>
              {!video.haveUpVoted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

//   const currentImageRender = (video: Video, isCurrentlyPlaying: boolean) => (
//     <Card key={video.id} className="bg-gray-800">
//       <CardContent className="p-4 flex flex-col space-y-4">
//         <div className="aspect-video">
//         <Image
//             src=
//             alt="Profile picture"
//             width={500}
//             height={500}
//         />
//         </div>
//       </CardContent>
//     </Card>
//   )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Music Queue Dashboard</h1>
          <div className="flex space-x-2">
            <Button onClick={shareQueue}>
              <Share className="h-4 w-4 mr-2" />
              Share Queue
            </Button>
            <Button onClick={() => status === "authenticated" ? signOut() : signIn()}>
              {status === "authenticated" ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter YouTube URL"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value)
              const videoId = getVideoId(e.target.value)
              if (videoId) {
                setPreviewVideo(videoId)
              } else {
                setPreviewVideo(null)
              }
            }}
            className="flex-grow text-black"
          />
          <Button onClick={addToQueue}>Add to Queue</Button>
        </div>
        
        {previewVideo && (
          <Card className="bg-gray-800">
            <CardContent className="p-4">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${previewVideo}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Preview"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentVideo && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-100">Now Playing</h2>
          {currentVideoRender(currentVideo, true)}
          {/* {playVideo ? currentVideoRender(currentVideo, true) : currentImageRender(currentVideo)} */}
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-200">{currentVideo.title}</h3>
              <p className="text-gray-300">Votes: {currentVideo.upvotes || 0}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button size="sm" onClick={() => vote(currentVideo.streamId, currentVideo.id, 1, currentVideo.haveUpVoted)}>
                {!currentVideo.haveUpVoted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
             
        <div className='grid justify-items-end'>
          <Button onClick={playNext}>
            <Play className='h-4 w-4 m-2'/>  
            Play Next
          </Button>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-100">Queue</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {queue.map((video) => renderVideoCard(video, false))}
          </div>
        </div>
      </div>
    </div>
  )
}