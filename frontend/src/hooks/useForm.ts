import { useState, useCallback } from 'react'

interface FormState {
  [key: string]: any
}

interface FormErrors {
  [key: string]: string
}

interface FormTouched {
  [key: string]: boolean
}

export interface UseFormReturn {
  values: FormState
  errors: FormErrors
  touched: FormTouched
  dirty: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleSubmit: (onSubmit: (values: FormState) => void | Promise<void>) => (e: React.FormEvent) => void
  setFieldValue: (field: string, value: any) => void
  setFieldError: (field: string, error: string) => void
  reset: () => void
  setValues: (values: FormState) => void
}

export function useForm(initialValues: FormState, validate?: (values: FormState) => FormErrors): UseFormReturn {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})

  const dirty = JSON.stringify(values) !== JSON.stringify(initialValues)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    if (validate) {
      const fieldErrors = validate(values)
      setErrors(fieldErrors)
    }
  }, [validate, values])

  const handleSubmit = useCallback(
    (onSubmit: (values: FormState) => void | Promise<void>) => async (e: React.FormEvent) => {
      e.preventDefault()
      
      const newTouched: FormTouched = {}
      Object.keys(values).forEach((key) => {
        newTouched[key] = true
      })
      setTouched(newTouched)

      if (validate) {
        const fieldErrors = validate(values)
        setErrors(fieldErrors)
        if (Object.keys(fieldErrors).length > 0) {
          return
        }
      }

      await onSubmit(values)
    },
    [validate, values],
  )

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const handleSetValues = useCallback((newValues: FormState) => {
    setValues(newValues)
  }, [])

  return {
    values,
    errors,
    touched,
    dirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    setValues: handleSetValues,
  }
}
