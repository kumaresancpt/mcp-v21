import { renderHook, act } from '@testing-library/react'
import { useForm } from '../hooks/useForm'

describe('useForm', () => {
  const initialValues = {
    fullName: '',
    email: '',
    phone: '',
  }

  const validate = (values: any) => {
    const errors: any = {}
    if (!values.fullName) errors.fullName = 'Full Name is required'
    if (!values.email) errors.email = 'Email is required'
    if (!values.phone) errors.phone = 'Phone is required'
    return errors
  }

  it('returns initial form values on mount', () => {
    const { result } = renderHook(() => useForm(initialValues, validate))
    expect(result.current.values).toEqual(initialValues)
  })

  it('updates form values when handleChange is called', () => {
    const { result } = renderHook(() => useForm(initialValues, validate))
    act(() => {
      result.current.handleChange({
        target: { name: 'fullName', value: 'John Doe', type: 'text' },
      } as any)
    })
    expect(result.current.values.fullName).toBe('John Doe')
  })

  it('marks field as touched when handleBlur is called', () => {
    const { result } = renderHook(() => useForm(initialValues, validate))
    act(() => {
      result.current.handleBlur({
        target: { name: 'fullName' },
      } as any)
    })
    expect(result.current.touched.fullName).toBe(true)
  })

  it('runs validation and sets errors when validate function is provided', () => {
    const { result } = renderHook(() => useForm(initialValues, validate))
    act(() => {
      result.current.handleBlur({
        target: { name: 'fullName' },
      } as any)
    })
    expect(result.current.errors.fullName).toBe('Full Name is required')
  })

  it('resets form state when reset is called', () => {
    const { result } = renderHook(() => useForm(initialValues, validate))
    act(() => {
      result.current.handleChange({
        target: { name: 'fullName', value: 'John Doe', type: 'text' },
      } as any)
    })
    expect(result.current.values.fullName).toBe('John Doe')
    act(() => {
      result.current.reset()
    })
    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
  })
})
