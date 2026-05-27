import { renderHook, act, waitFor } from '@testing-library/react'
import { usePhotoUpload } from '../hooks/usePhotoUpload'

// Mock fetch
global.fetch = jest.fn()

describe('usePhotoUpload', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
    localStorage.clear()
  })

  it('validates file type and rejects non-image files', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' })

    await act(async () => {
      try {
        await result.current.upload(txtFile)
      } catch (error: any) {
        expect(error.message).toContain('Invalid file type')
      }
    })

    expect(result.current.error).toBeTruthy()
  })

  it('rejects files larger than 2MB', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

    await act(async () => {
      try {
        await result.current.upload(largeFile)
      } catch (error: any) {
        expect(error.message).toContain('2MB')
      }
    })

    expect(result.current.error).toBeTruthy()
  })

  it('uploads valid JPG file and returns signed URL', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photoUrl: 'https://example.com/photo.jpg' }),
    })

    const { result } = renderHook(() => usePhotoUpload())
    const jpgFile = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' })

    let uploadResult: string | undefined
    await act(async () => {
      uploadResult = await result.current.upload(jpgFile)
    })

    expect(uploadResult).toBe('https://example.com/photo.jpg')
    expect(global.fetch).toHaveBeenCalledWith('/api/visitors/upload-photo', expect.any(Object))
  })

  it('uploads valid PNG file and returns signed URL', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photoUrl: 'https://example.com/photo.png' }),
    })

    const { result } = renderHook(() => usePhotoUpload())
    const pngFile = new File(['fake-image-data'], 'photo.png', { type: 'image/png' })

    let uploadResult: string | undefined
    await act(async () => {
      uploadResult = await result.current.upload(pngFile)
    })

    expect(uploadResult).toBe('https://example.com/photo.png')
  })

  it('handles upload error and sets error state', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'))

    const { result } = renderHook(() => usePhotoUpload())
    const jpgFile = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' })

    await act(async () => {
      try {
        await result.current.upload(jpgFile)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    expect(result.current.loading).toBe(false)
  })
})
