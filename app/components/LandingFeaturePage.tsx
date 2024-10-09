"use client";
import React, { useState } from 'react'
import {Users,ThumbsUp, Headphones, Radio } from "lucide-react"
const LandingFeaturePage = () => {
    const [activeFeature, setActiveFeature] = useState(0)

    const features = [
        {
          title: "Create Group Sessions",
          icon: <Users className="h-12 w-12 mb-4 text-primary" />,
          description: "Start a music session and invite friends to join. Control who can add songs and vote."
        },
        {
          title: "Democratic Playlist",
          icon: <ThumbsUp className="h-12 w-12 mb-4 text-primary" />,
          description: "Vote on songs in the queue. The most popular tracks rise to the top."
        },
        {
          title: "Discover New Music",
          icon: <Radio className="h-12 w-12 mb-4 text-primary" />,
          description: "Explore new genres and artists through your friends' additions to the playlist."
        },
        {
          title: "Real-time Sync",
          icon: <Headphones className="h-12 w-12 mb-4 text-primary" />,
          description: "Listen together in perfect sync, no matter where your group members are located."
        }
    ]
  return (
    (
        <>
            {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg transition-all duration-300 cursor-pointer ${
                activeFeature === index ? 'bg-gray-800 shadow-lg' : 'bg-gray-900'
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                {feature.icon}
                <span className="ml-4">{feature.title}</span>
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}

        </>
        
    )
  )
}

export default LandingFeaturePage