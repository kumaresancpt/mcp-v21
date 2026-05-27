import { useState, useRef } from 'react'

interface PhotoCaptureProps {
  onSave: (blob: Blob) => void
  onCancel: () => void
}

export function PhotoCapture({ onSave, onCancel }: PhotoCaptureProps) {
  const [mode, setMode] = useState<'webcam' | 'upload'>('webcam')
  const [preview, setPreview] = useState<string | null>(null)
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, size: 200 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        alert('Please upload JPG, PNG, or JPEG image.')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePhoto = () => {
    if (preview) {
      // Convert preview to blob and crop
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set canvas to 1:1 aspect ratio (square)
        canvas.width = 200
        canvas.height = 200

        // Draw cropped image
        const sourceSize = Math.min(img.width, img.height)
        const sourceX = (img.width - sourceSize) / 2
        const sourceY = (img.height - sourceSize) / 2

        ctx?.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 200, 200)

        canvas.toBlob((blob) => {
          if (blob) {
            onSave(blob)
          }
        }, 'image/jpeg', 0.9)
      }

      img.src = preview
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card p-6 max-w-md w-full max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Capture Photo</h3>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('webcam')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === 'webcam'
                ? 'bg-primary text-white'
                : 'bg-border-light text-text-primary hover:bg-border-medium'
            }`}
          >
            Webcam
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === 'upload'
                ? 'bg-primary text-white'
                : 'bg-border-light text-text-primary hover:bg-border-medium'
            }`}
          >
            Upload
          </button>
        </div>

        {/* File Upload Mode */}
        {mode === 'upload' && (
          <div>
            <div
              className="border-2 border-dashed border-border-medium rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-bg-primary transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-sm text-text-secondary mb-2">Drag and drop your image here</p>
              <p className="text-xs text-text-secondary">or click to select a file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-4">
            <div className="relative inline-block w-full">
              <img src={preview} alt="Preview" className="w-full rounded-lg" />
              <div
                className="absolute border-4 border-primary rounded-lg"
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.size}px`,
                  height: `${cropBox.size}px`,
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button onClick={onCancel} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button onClick={handleSavePhoto} disabled={!preview} className="flex-1 btn-primary">
            Save Photo
          </button>
        </div>
      </div>
    </div>
  )
}
