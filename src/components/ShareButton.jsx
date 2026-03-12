import React, { useState, useEffect, useRef } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ShareButton = ({ item }) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)
  const btnRef = useRef(null)



  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Build sharable content based on item type
  const getShareData = () => {
    const { type, title, content, url, fileUrl } = item

    if (type === 'document' && fileUrl) {
      return {
        text: `📄 ${title}`,
        url: fileUrl,
        whatsappText: `📄 *${title}*\n${fileUrl}`
      }
    }
    if ((type === 'link' || type === 'video') && url) {
      return {
        text: `🔗 ${title}`,
        url: url,
        whatsappText: `🔗 *${title}*\n${url}`
      }
    }
    if (type === 'note') {
      const notePreview = (content || '').slice(0, 500)
      return {
        text: `📝 ${title}\n\n${notePreview}`,
        url: null,
        whatsappText: `📝 *${title}*\n\n${notePreview}`
      }
    }
    return {
      text: title || 'Check this out!',
      url: null,
      whatsappText: title || 'Check this out!'
    }
  }

  const handleWhatsApp = () => {
    const { whatsappText } = getShareData()
    const waUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
    window.open(waUrl, '_blank')
    setOpen(false)
  }

  const handleCopy = async () => {
    const { text, url } = getShareData()
    const copyText = url ? `${text}\n${url}` : text
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
    setOpen(false)
  }

  const handleNativeShare = async () => {
    const { text, url } = getShareData()
    try {
      await navigator.share({
        title: item.title,
        text: text,
        ...(url ? { url } : {})
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Sharing failed')
      }
    }
    setOpen(false)
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Share Menu */}
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-fade-in"
        >
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            WhatsApp
          </button>

          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {hasNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              More options...
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ShareButton
