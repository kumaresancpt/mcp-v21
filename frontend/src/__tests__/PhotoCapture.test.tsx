import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoCapture } from '../components/PhotoCapture'

describe('PhotoCapture', () => {
  it('renders modal with title "Capture Photo"', () => {
    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()
    render(<PhotoCapture onSave={mockOnSave} onCancel={mockOnCancel} />)
    const title = screen.getByText('Capture Photo')
    expect(title).toBeInTheDocument()
  })

  it('renders Webcam and Upload mode tabs', () => {
    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()
    render(<PhotoCapture onSave={mockOnSave} onCancel={mockOnCancel} />)
    const webcamTab = screen.getByText('Webcam')
    const uploadTab = screen.getByText('Upload')
    expect(webcamTab).toBeInTheDocument()
    expect(uploadTab).toBeInTheDocument()
  })

  it('renders file upload area with drag-drop prompt', () => {
    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()
    render(<PhotoCapture onSave={mockOnSave} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText('Upload'))
    const dragDropText = screen.getByText(/Drag and drop your image here/)
    const clickText = screen.getByText(/or click to select a file/)
    expect(dragDropText).toBeInTheDocument()
    expect(clickText).toBeInTheDocument()
  })

  it('renders file input that accepts image files', () => {
    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()
    render(<PhotoCapture onSave={mockOnSave} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByText('Upload'))
    const fileInput = screen.getByRole('button', { name: /Drag and drop/ })
      .parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput?.accept).toBe('image/*')
  })

  it('calls onCancel when clicking Cancel button', () => {
    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()
    render(<PhotoCapture onSave={mockOnSave} onCancel={mockOnCancel} />)
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
