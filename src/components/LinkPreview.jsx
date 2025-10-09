import React, { useState, useEffect } from 'react'
import { ExternalLink, Play, Image as ImageIcon } from 'lucide-react'

const LinkPreview = ({ url, type, itemTitle }) => {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Extract video ID for YouTube
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Best-effort metadata via Microlink (works for Twitter/X, Instagram, etc.)
  const fetchMicrolink = async (targetUrl) => {
    const resp = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&audio=false&video=false&screenshot=false`)
    if (!resp.ok) return null
    const data = await resp.json()
    return data && data.status === 'success' ? data.data : null
  }

  useEffect(() => {
    const fetchPreview = async () => {
      if (!url) return

      try {
        setLoading(true)
        setError(false)

        // YouTube preview
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = getYouTubeVideoId(url)
          if (videoId) {
            setPreview({
              type: 'youtube',
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              fallback: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              title: 'YouTube Video',
              url: url
            })
            setLoading(false)
            return
          }
        }

        // First try Microlink for rich preview (supports Twitter/X, Instagram, etc.)
        try {
          const ml = await fetchMicrolink(url)
          if (ml) {
            const imageUrl = ml.image?.url || ml.logo?.url || null
            if (imageUrl || ml.title || ml.description) {
              setPreview({
                type: 'generic',
                thumbnail: imageUrl,
                title: ml.title || ml.publisher || 'Link Preview',
                description: ml.description,
                url: url
              })
              setLoading(false)
              return
            }
          }
        } catch (_) {}

        // Generic link preview using a free API
        try {
          const response = await fetch(`https://api.linkpreview.net/?key=5b54e&q=${encodeURIComponent(url)}`)
          if (response.ok) {
            const data = await response.json()
            if (data.image || data.title || data.description) {
              setPreview({
                type: 'generic',
                thumbnail: data.image || null,
                title: data.title || 'Link Preview',
                description: data.description,
                url: url
              })
              setLoading(false)
              return
            }
          }
        } catch (apiError) {
          // ignore
        }

        // Fallback for other links
        setPreview({
          type: 'generic',
          thumbnail: null,
          title: 'External Link',
          url: url
        })

      } catch (err) {
        console.error('Error fetching preview:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [url])

  if (loading) {
    return (
      <div className="mt-2 flex-1">
        <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg animate-pulse">
          <div className="w-4 h-4 bg-slate-300 rounded"></div>
          <span className="text-sm text-slate-500">Loading preview...</span>
        </div>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div className="mt-2 flex-1">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-blue-600 hover:text-blue-700 break-all inline-flex items-center gap-1 line-clamp-2"
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{url}</span>
        </a>
      </div>
    )
  }

  return (
    <div className="mt-2 flex-1">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          {preview.thumbnail && (
            <div className="relative aspect-[16/9] md:aspect-[16/9] lg:aspect-[16/9] bg-slate-100">
              <img 
                src={preview.thumbnail} 
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a different thumbnail if the first one fails
                  if (preview.fallback && e.target.src !== preview.fallback) {
                    e.target.src = preview.fallback
                  } else {
                    e.target.style.display = 'none'
                  }
                }}
              />
              {preview.type === 'youtube' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white rounded-full p-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4" />
                  </div>
                </div>
              )}
              {preview.type === 'twitter' && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              )}
              {preview.type === 'instagram' && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              )}
            </div>
          )}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1">
              {preview.type === 'youtube' && <Play className="w-3 h-3 text-red-600" />}
              {preview.type === 'twitter' && (
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              )}
              {preview.type === 'instagram' && (
                <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              )}
              {preview.type === 'generic' && <ExternalLink className="w-3 h-3 text-slate-500" />}
              <span className="text-sm font-medium text-slate-900 truncate">
                {itemTitle || preview.title}
              </span>
            </div>
            {preview.description && (
              <p className="text-xs text-slate-600 line-clamp-2">
                {preview.description}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1 truncate">
              {url}
            </p>
          </div>
        </div>
      </a>
    </div>
  )
}

export default LinkPreview
