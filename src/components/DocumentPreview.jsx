import React, { useMemo } from 'react'
import { FileText } from 'lucide-react'

const DocumentPreview = ({ fileUrl, title }) => {
  const isPdf = useMemo(() => /\.pdf($|\?)/i.test(String(fileUrl || '')), [fileUrl])

  if (!fileUrl) {
    return (
      <div className="aspect-video bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-500">
          <FileText className="w-8 h-8 mb-1" />
          <span className="text-xs">No file</span>
        </div>
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="aspect-video bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
        <object data={fileUrl} type="application/pdf" className="w-full h-full">
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <FileText className="w-8 h-8 mr-2" />
            <span className="text-xs">Preview not available</span>
          </div>
        </object>
      </div>
    )
  }

  // Fallback generic doc preview
  return (
    <div className="aspect-video bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center text-slate-500">
        <FileText className="w-8 h-8 mb-1" />
        <span className="text-xs truncate max-w-[90%]" title={title || 'Document'}>{title || 'Document'}</span>
      </div>
    </div>
  )
}

export default DocumentPreview


