'use client'

import { useState } from 'react'
import { isVideoID } from '@/lib/validation'

export function Video({ id, title }: { id: string; title: string }) {
  const [enabled, setEnabled] = useState(false)
  if (!isVideoID(id)) return <p role="alert">This video could not be displayed.</p>
  return (
    <div className="video">
      {enabled ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div>
          <span className="eyebrow">Moving images</span>
          <h3>{title}</h3>
          <p>Playing this video connects to YouTube. No video is loaded before this action.</p>
          <button className="button" onClick={() => setEnabled(true)}>
            Load video ↗
          </button>
        </div>
      )}
    </div>
  )
}
