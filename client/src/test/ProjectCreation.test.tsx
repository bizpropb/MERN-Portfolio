import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { DarkModeProvider } from '../contexts/DarkModeContext'
import ProjectCreateModal from '../components/ProjectCreateModal'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <DarkModeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DarkModeProvider>
  </BrowserRouter>
)

describe('Project Creation Workflow', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    global.fetch = mockFetch
    localStorage.clear()
  })

  it('should handle authentication failure', async () => {
    const user = userEvent.setup()

    // Mock failed login
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          message: 'Invalid credentials'
        })
      })
    )

    const TestComponent = () => {
      const [error, setError] = React.useState('')

      const handleLogin = async () => {
        try {
          const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: 'wrong@email.com', 
              password: 'wrongpassword' 
            })
          })
          const data = await response.json()
          if (!data.success) {
            setError(data.message)
          }
        } catch (err) {
          setError('Network error')
        }
      }

      return (
        <div>
          <button onClick={handleLogin} data-testid="login-btn">
            Login with Wrong Credentials
          </button>
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const loginBtn = screen.getByTestId('login-btn')
    await user.click(loginBtn)

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials')
    })
  })

  it('should validate project creation form', async () => {
    const user = userEvent.setup()

    const TestComponent = () => {
      const [isModalOpen, setIsModalOpen] = React.useState(true)

      return (
        <div>
          <ProjectCreateModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onProjectCreate={() => {}}
          />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Try to submit without filling required fields
    const submitBtn = screen.getByText('Create Project')
    await user.click(submitBtn)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()
      expect(screen.getByText('At least one technology is required')).toBeInTheDocument()
    })
  })
})