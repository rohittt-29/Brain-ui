import React, { useEffect, useMemo, useState } from 'react'

const typeOptions = [
  { value: 'note', label: 'Note' },
  { value: 'link', label: 'Link' },
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
]

const ItemForm = ({ mode = 'create', initial = {}, onSubmit, onCancel, submitting }) => {
  const [title, setTitle] = useState(initial?.title || '')
  const [type, setType] = useState(initial?.type || 'note')
  const [content, setContent] = useState(initial?.content || '')
  const [url, setUrl] = useState(initial?.url || '')
  const [filePath, setFilePath] = useState(initial?.filePath || '')
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(', '))

  // Only reset local state when switching modes or editing a different item
  useEffect(() => {
    if (mode === 'edit') {
      setTitle(initial?.title || '')
      setType(initial?.type || 'note')
      setContent(initial?.content || '')
      setUrl(initial?.url || '')
      setFilePath(initial?.filePath || '')
      setTagsInput((initial?.tags || []).join(', '))
    } else if (mode === 'create') {
      // Do not continuously reset while typing; only when mode toggles to create
      setTitle('')
      setType('note')
      setContent('')
      setUrl('')
      setFilePath('')
      setTagsInput('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initial?._id])

  const tags = useMemo(() => tagsInput.split(',').map((t) => t.trim()).filter(Boolean), [tagsInput])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { title, type, tags }
    if (type === 'note') payload.content = content
    if (type === 'link' || type === 'video') payload.url = url
    if (type === 'document') payload.filePath = filePath
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2" placeholder="Title" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {type === 'note' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={4} placeholder="Write your note..." />
        </div>
      )}

      {(type === 'link' || type === 'video') && (
        <div>
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="https://..." />
        </div>
      )}

      {type === 'document' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">File Path</label>
          <input value={filePath} onChange={(e) => setFilePath(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="/uploads/file.pdf" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="work, personal, urgent" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 text-sm rounded bg-black text-white disabled:opacity-50">
          {submitting ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create' : 'Save')}
        </button>
      </div>
    </form>
  )
}

export default ItemForm


