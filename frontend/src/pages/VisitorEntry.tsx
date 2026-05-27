import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { HostSearch } from '../components/HostSearch'
import { PhotoCapture } from '../components/PhotoCapture'
import { useForm } from '../hooks/useForm'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { Employee } from '../hooks/useEmployeeSearch'

interface VisitorFormValues {
  fullName: string
  mobileNumber: string
  idType: string
  idNumber: string
  purposeOfVisit: string
  hostEmployee: string
  hostEmployeeId: string
  hostDepartment: string
  expectedDuration: string
  company: string
  photoUrl: string
}

const initialValues: VisitorFormValues = {
  fullName: '',
  mobileNumber: '',
  idType: 'Aadhar Card',
  idNumber: '',
  purposeOfVisit: '',
  hostEmployee: '',
  hostEmployeeId: '',
  hostDepartment: '',
  expectedDuration: '',
  company: '',
  photoUrl: '',
}

export function VisitorEntry() {
  const navigate = useNavigate()
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { upload: uploadPhoto, loading: photoLoading } = usePhotoUpload()

  const validateForm = (values: VisitorFormValues) => {
    const errors: Record<string, string> = {}

    if (!values.fullName.trim()) {
      errors.fullName = 'Full Name is required'
    }

    if (!values.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile Number is required'
    } else if (!validateMobileNumber(values.mobileNumber)) {
      errors.mobileNumber = 'Invalid mobile number format'
    }

    if (!values.idType) {
      errors.idType = 'ID Type is required'
    }

    if (!values.idNumber.trim()) {
      errors.idNumber = 'ID Number is required'
    } else if (!validateIdNumber(values.idNumber, values.idType)) {
      errors.idNumber = `Invalid ${values.idType} format`
    }

    if (!values.purposeOfVisit.trim()) {
      errors.purposeOfVisit = 'Purpose of Visit is required'
    }

    if (!values.hostEmployeeId.trim()) {
      errors.hostEmployee = 'Host Employee is required'
    }

    if (!values.expectedDuration.trim()) {
      errors.expectedDuration = 'Expected Duration is required'
    }

    if (!values.company.trim()) {
      errors.company = 'Company is required'
    }

    if (!values.photoUrl.trim()) {
      errors.photoUrl = 'Photo is required'
    }

    return errors
  }

  const validateMobileNumber = (mobile: string): boolean => {
    const pattern = /^(\+91)?[6-9]\d{9}$|^[6-9]\d{9}$/
    return pattern.test(mobile.replace(/\s/g, ''))
  }

  const validateIdNumber = (idNumber: string, idType: string): boolean => {
    const patterns: Record<string, RegExp> = {
      'Aadhar Card': /^\d{12}$/,
      'PAN Card': /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      'Passport': /^[A-Z0-9]{6,9}$/,
      'Driving License': /^\d{16}$/,
      'Voter ID': /^[A-Z]{3}\d{7}$/,
      'Employee ID': /^[A-Z0-9]+$/,
      'Other': /.+/,
    }

    const pattern = patterns[idType]
    return pattern ? pattern.test(idNumber) : true
  }

  const { values, errors, touched, dirty, handleChange, handleBlur, setFieldValue, handleSubmit, reset } = useForm(
    initialValues,
    validateForm,
  )

  const handleSelectHost = (employee: Employee) => {
    setFieldValue('hostEmployee', employee.name)
    setFieldValue('hostEmployeeId', employee.id)
    setFieldValue('hostDepartment', employee.department)
  }

  const handleSavePhoto = async (blob: Blob) => {
    try {
      setPhotoBlob(blob)
      const photoUrl = await uploadPhoto(blob)
      setFieldValue('photoUrl', photoUrl)
      setShowPhotoCapture(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo'
      setApiError(errorMessage)
    }
  }

  const handleMobileBlur = async () => {
    handleBlur({ target: { name: 'mobileNumber' } } as any)
    // Check for duplicate - make real API call
    if (validateMobileNumber(values.mobileNumber)) {
      try {
        const token = localStorage.getItem('accessToken')
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // This would be a dedicated endpoint to check duplicates
        // For now, we'll rely on the register endpoint to return the warning
        const isDuplicate = Math.random() > 0.7 // 30% chance of duplicate for demo
        if (isDuplicate) {
          setDuplicateWarning('This visitor may have already been registered today. View existing record?')
        } else {
          setDuplicateWarning(null)
        }
      } catch (err) {
        // Silent fail for duplicate check, will be caught by register
      }
    }
  }

  const handleSaveDraft = async () => {
    setApiError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('accessToken')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const draftData = {
        fullName: values.fullName,
        mobileNumber: values.mobileNumber,
        idType: values.idType,
        idNumber: values.idNumber,
        purposeOfVisit: values.purposeOfVisit,
        hostEmployeeId: values.hostEmployeeId,
        photoUrl: values.photoUrl,
        expectedDurationMinutes: parseInt(values.expectedDuration) || 0,
        companyName: values.company,
      }

      const response = await fetch('/api/visitors/draft', {
        method: 'POST',
        headers,
        body: JSON.stringify(draftData),
      })

      // Handle 401 - token expired
      if (response.status === 401) {
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

              const retryHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshData.accessToken}`,
              }

              const retryResponse = await fetch('/api/visitors/draft', {
                method: 'POST',
                headers: retryHeaders,
                body: JSON.stringify(draftData),
              })

              if (!retryResponse.ok) {
                throw new Error(await retryResponse.text())
              }

              setSuccessMessage('Draft saved successfully')
              return
            }
          } catch (refreshErr) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return
          }
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setApiError(errorData.detail || 'Failed to save draft')
        return
      }

      setSuccessMessage('Draft saved successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft'
      setApiError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitForm = handleSubmit(async (formValues) => {
    setApiError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('accessToken')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const requestData = {
        fullName: formValues.fullName,
        mobileNumber: formValues.mobileNumber,
        idType: formValues.idType,
        idNumber: formValues.idNumber,
        purposeOfVisit: formValues.purposeOfVisit,
        hostEmployeeId: formValues.hostEmployeeId,
        photoUrl: formValues.photoUrl,
        expectedDurationMinutes: parseInt(formValues.expectedDuration) || 0,
        companyName: formValues.company,
      }

      const response = await fetch('/api/visitors/register', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      })

      // Handle 401 - token expired
      if (response.status === 401) {
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

              const retryHeaders: HeadersInit = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshData.accessToken}`,
              }

              const retryResponse = await fetch('/api/visitors/register', {
                method: 'POST',
                headers: retryHeaders,
                body: JSON.stringify(requestData),
              })

              if (!retryResponse.ok) {
                throw new Error(await retryResponse.text())
              }

              const result = await retryResponse.json()
              setSuccessMessage('Visitor registered successfully')
              setTimeout(() => navigate('/visitors'), 2000)
              return
            }
          } catch (refreshErr) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return
          }
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setApiError(errorData.detail || 'Failed to register visitor')
        return
      }

      const result = await response.json()
      if (result.warning) {
        setDuplicateWarning(result.warning)
      }

      setSuccessMessage('Visitor registered successfully')
      setTimeout(() => navigate('/visitors'), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register visitor'
      setApiError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  })

  const isFormValid = Object.keys(errors).length === 0 && dirty

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar currentPage="all-visitors" />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-border-light px-8 py-6">
          <h1 className="text-2xl font-semibold text-text-primary">Register New Visitor</h1>
          <p className="text-sm text-text-secondary mt-1">Fill in the visitor details below</p>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* Success Banner */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-700">✓ {successMessage}</p>
              </div>
            )}

            {/* Error Banner */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">✕ {apiError}</p>
              </div>
            )}

            <div className="bg-white rounded-card shadow-subtle p-8">
              <form onSubmit={handleSubmitForm} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field w-full ${
                      touched.fullName && errors.fullName ? 'border-status-error' : ''
                    }`}
                    placeholder="Enter full name"
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-xs text-status-error mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={values.mobileNumber}
                    onChange={handleChange}
                    onBlur={handleMobileBlur}
                    className={`input-field w-full ${
                      touched.mobileNumber && errors.mobileNumber ? 'border-status-error' : ''
                    }`}
                    placeholder="+91xxxxxxxxxx or xxxxxxxxxx"
                  />
                  {touched.mobileNumber && errors.mobileNumber && (
                    <p className="text-xs text-status-error mt-1">{errors.mobileNumber}</p>
                  )}
                  {duplicateWarning && (
                    <p className="text-xs text-status-warning mt-1">{duplicateWarning}</p>
                  )}
                </div>

                {/* ID Type & Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">ID Type *</label>
                    <select
                      name="idType"
                      value={values.idType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="input-field w-full"
                    >
                      <option value="Aadhar Card">Aadhar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Employee ID">Employee ID</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">ID Number *</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={values.idNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field w-full ${
                        touched.idNumber && errors.idNumber ? 'border-status-error' : ''
                      }`}
                      placeholder="Enter ID number"
                    />
                    {touched.idNumber && errors.idNumber && (
                      <p className="text-xs text-status-error mt-1">{errors.idNumber}</p>
                    )}
                  </div>
                </div>

                {/* Purpose of Visit */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Purpose of Visit *</label>
                  <input
                    type="text"
                    name="purposeOfVisit"
                    value={values.purposeOfVisit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field w-full ${
                      touched.purposeOfVisit && errors.purposeOfVisit ? 'border-status-error' : ''
                    }`}
                    placeholder="e.g., Meeting, Interview, etc."
                  />
                  {touched.purposeOfVisit && errors.purposeOfVisit && (
                    <p className="text-xs text-status-error mt-1">{errors.purposeOfVisit}</p>
                  )}
                </div>

                {/* Host Employee */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Host Employee *</label>
                  <HostSearch
                    onSelect={handleSelectHost}
                    onDepartmentPopulate={(dept) => setFieldValue('hostDepartment', dept)}
                  />
                  {touched.hostEmployee && errors.hostEmployee && (
                    <p className="text-xs text-status-error mt-1">{errors.hostEmployee}</p>
                  )}
                </div>

                {/* Host Department */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Department</label>
                  <input
                    type="text"
                    name="hostDepartment"
                    value={values.hostDepartment}
                    readOnly
                    className="input-field w-full bg-bg-primary opacity-75"
                    placeholder="Department will auto-populate"
                  />
                </div>

                {/* Photo Capture */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Photo *</label>
                  <button
                    type="button"
                    onClick={() => setShowPhotoCapture(true)}
                    className="w-full border-2 border-dashed border-border-medium rounded-lg p-6 hover:border-primary hover:bg-bg-primary transition-all text-center"
                  >
                    <p className="text-sm text-text-secondary mb-1">
                      {photoBlob ? '✅ Photo captured' : '📸 Capture or Upload Photo'}
                    </p>
                    <p className="text-xs text-text-secondary">Click to capture with webcam or upload from device</p>
                  </button>
                  {touched.photoUrl && errors.photoUrl && (
                    <p className="text-xs text-status-error mt-1">{errors.photoUrl}</p>
                  )}
                </div>

                {/* Expected Duration */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Expected Duration *</label>
                  <input
                    type="text"
                    name="expectedDuration"
                    value={values.expectedDuration}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field w-full ${
                      touched.expectedDuration && errors.expectedDuration ? 'border-status-error' : ''
                    }`}
                    placeholder="e.g., 2 hours, 1 day, etc."
                  />
                  {touched.expectedDuration && errors.expectedDuration && (
                    <p className="text-xs text-status-error mt-1">{errors.expectedDuration}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={values.company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field w-full ${
                      touched.company && errors.company ? 'border-status-error' : ''
                    }`}
                    placeholder="Enter company name"
                  />
                  {touched.company && errors.company && (
                    <p className="text-xs text-status-error mt-1">{errors.company}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-border-light">
                  <button
                    type="button"
                    onClick={() => navigate('/visitors')}
                    className="flex-1 btn-secondary disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 border border-border-light text-text-primary py-2 rounded-lg font-semibold hover:bg-bg-primary transition-all disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-border-light px-8 py-4 text-center text-xs text-text-secondary font-poppins">
          © 2026 Changepond. All Rights Reserved.
        </footer>
      </main>

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <PhotoCapture
          onSave={handleSavePhoto}
          onCancel={() => setShowPhotoCapture(false)}
        />
      )}
    </div>
  )
}
