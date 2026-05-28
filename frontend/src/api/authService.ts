// Registration request payload
export interface RegisterRequest {
  name: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

// Registration response payload
export interface RegisterResponse {
  message?: string
  detail?: string
  userId?: string
  [key: string]: unknown
}

// Register a new user
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const responseData = (await response.json()) as RegisterResponse

    if (!response.ok) {
      // Include the detail from API response for better error messaging
      throw new Error(responseData.detail || 'Registration failed. Please try again.')
    }

    return responseData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error. Please try again.')
  }
}
