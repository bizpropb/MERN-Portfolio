import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { DarkModeProvider } from '../contexts/DarkModeContext'
import ProjectCreateModal from '../components/ProjectCreateModal'

// Mock the AuthProvider since we're testing just the modal
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', firstName: 'Test', lastName: 'User' },
    token: 'mock-token',
    loading: false
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Test wrapper component providing required context providers for modal testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <DarkModeProvider>
      {children}
    </DarkModeProvider>
  </BrowserRouter>
)

describe('ProjectCreateModal Unit Tests', () => {
  const mockOnClose = vi.fn()
  const mockOnProjectCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
  })

  it('should render the modal when open', () => {
    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={true}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter project title...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe your project...')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={false}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
      </TestWrapper>
    )

    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
  })

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={true}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
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


  it('should handle successful project creation', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    const mockProject = {
      _id: '123',
      title: 'Test Project',
      description: 'Test description',
      technologies: ['React'],
      status: 'planning',
      priority: 'medium',
      featured: false,
      likes: 0,
      views: 0,
      userId: { _id: '1', firstName: 'Test', lastName: 'User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { project: mockProject }
      })
    })

    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={true}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
      </TestWrapper>
    )

    // Fill out the form correctly
    const titleInput = screen.getByPlaceholderText('Enter project title...')
    const descriptionInput = screen.getByPlaceholderText('Describe your project...')

    await user.type(titleInput, 'Test Project')
    await user.type(descriptionInput, 'Test description')

    // Select React technology
    const reactCheckbox = screen.getByLabelText('React')
    await user.click(reactCheckbox)

    // Submit the form
    const submitBtn = screen.getByText('Create Project')
    await user.click(submitBtn)

    // Wait for the API call and callback
    await waitFor(() => {
      expect(mockOnProjectCreate).toHaveBeenCalledWith(mockProject)
      expect(mockOnClose).toHaveBeenCalled()
    })

    // Verify the API was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/projects',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: expect.stringContaining('"title":"Test Project"')
      })
    )
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Mock API error
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        message: 'Server error creating project'
      })
    })

    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={true}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
      </TestWrapper>
    )

    // Fill out the form
    const titleInput = screen.getByPlaceholderText('Enter project title...')
    const descriptionInput = screen.getByPlaceholderText('Describe your project...')

    await user.type(titleInput, 'Test Project')
    await user.type(descriptionInput, 'Test description')

    const reactCheckbox = screen.getByLabelText('React')
    await user.click(reactCheckbox)

    const submitBtn = screen.getByText('Create Project')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error creating project: Server error creating project')
    })

    // Modal should still be open on error
    expect(screen.getByText('Create New Project')).toBeInTheDocument()

    consoleSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it('should handle technology selection correctly', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={true}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
      </TestWrapper>
    )

    // Select multiple technologies
    const reactCheckbox = screen.getByLabelText('React')
    const typescriptCheckbox = screen.getByLabelText('TypeScript')
    const nodejsCheckbox = screen.getByLabelText('Node.js')

    await user.click(reactCheckbox)
    await user.click(typescriptCheckbox)
    await user.click(nodejsCheckbox)

    expect(reactCheckbox).toBeChecked()
    expect(typescriptCheckbox).toBeChecked()
    expect(nodejsCheckbox).toBeChecked()

    // Unselect one
    await user.click(typescriptCheckbox)
    expect(typescriptCheckbox).not.toBeChecked()
    expect(reactCheckbox).toBeChecked()
    expect(nodejsCheckbox).toBeChecked()
  })

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ProjectCreateModal
          isOpen={true}
          onClose={mockOnClose}
          onProjectCreate={mockOnProjectCreate}
        />
      </TestWrapper>
    )

    // Find and click the close button (X)
    const closeButton = screen.getByLabelText('Close modal')
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})