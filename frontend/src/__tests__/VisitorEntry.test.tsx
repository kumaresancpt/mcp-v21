import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { VisitorEntry } from '../pages/VisitorEntry'

// Mock hooks
jest.mock('../hooks/useForm', () => ({
  useForm: (initialValues: any, validate: any) => ({
    values: {
      ...initialValues,
      photoUrl: '',
    },
    errors: {},
    touched: {},
    dirty: false,
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    setFieldValue: jest.fn(),
    handleSubmit: (onSubmit: any) => (e: any) => {
      e.preventDefault()
      onSubmit(initialValues)
    },
    reset: jest.fn(),
  }),
}))

jest.mock('../hooks/usePhotoUpload', () => ({
  usePhotoUpload: () => ({
    upload: jest.fn().mockResolvedValue('https://example.com/photo.jpg'),
    loading: false,
    error: null,
    progress: 0,
  }),
}))

jest.mock('../components/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

jest.mock('../components/HostSearch', () => ({
  HostSearch: () => <div data-testid="host-search">Host Search</div>,
}))

jest.mock('../components/PhotoCapture', () => ({
  PhotoCapture: ({ onSave, onCancel }: any) => (
    <div data-testid="photo-capture">
      <button onClick={onCancel} data-testid="close-photo">
        Cancel
      </button>
    </div>
  ),
}))

describe('VisitorEntry', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <VisitorEntry />
      </BrowserRouter>,
    )
  })

  it('renders form with Full Name input field', () => {
    const fullNameInput = screen.getByPlaceholderText(/full name/i)
    expect(fullNameInput).toBeInTheDocument()
  })

  it('renders form with Mobile Number input field', () => {
    const mobileInput = screen.getByPlaceholderText(/mobile/i)
    expect(mobileInput).toBeInTheDocument()
  })

  it('renders ID Type dropdown with Aadhar Card as default option', () => {
    const idTypeSelect = screen.getByDisplayValue(/Aadhar Card/i)
    expect(idTypeSelect).toBeInTheDocument()
  })

  it('renders form with ID Number input field', () => {
    const idNumberInput = screen.getByPlaceholderText(/id number/i)
    expect(idNumberInput).toBeInTheDocument()
  })

  it('renders form with Purpose of Visit input field', () => {
    const purposeInput = screen.getByPlaceholderText(/purpose/i)
    expect(purposeInput).toBeInTheDocument()
  })
})
