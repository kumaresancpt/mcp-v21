import { useState, useCallback } from 'react'

interface UsePhotoUploadReturn {
  upload: (file: File) => Promise<string>
  loading: boolean
  error: string | null
  progress: number
}

export function usePhotoUpload(): UsePhotoUploadReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(async (file: File): Promise<string> => {
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, or JPEG.')
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024 // 2MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 2MB limit.')
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + Math.random() * 30
        })
      }, 100)

      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('file', file)

      // Read token fresh from localStorage
      const token = localStorage.getItem('accessToken')
      const headers: HeadersInit = {}

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/visitors/upload-photo', {
        method: 'POST',
        headers,
        body: formData,
      })

      clearInterval(interval)

      // Handle 401 - token expired
      if (response.status === 401) {
        // Attempt token refresh
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const refreshResponse = await fetch('/api/auth/refresh-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            })

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              localStorage.setItem('accessToken', refreshData.accessToken)

              // Retry original request with new token
              const retryFormData = new FormData()
              retryFormData.append('file', file)

              const retryHeaders: HeadersInit = {
                Authorization: `Bearer ${refreshData.accessToken}`,
              }

              const retryResponse = await fetch('/api/visitors/upload-photo', {
                method: 'POST',
                headers: retryHeaders,
                body: retryFormData,
              })

              if (!retryResponse.ok) {
                throw new Error(await retryResponse.text())
              }

              const data = await retryResponse.json()
              setProgress(100)
              return data.photoUrl
            }
          } catch (refreshErr) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            throw refreshErr
          }
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          throw new Error('Session expired')
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to upload photo')
      }

      const data = await response.json()
      setProgress(100)
      return data.photoUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    upload,
    loading,
    error,
    progress,
  }
}
