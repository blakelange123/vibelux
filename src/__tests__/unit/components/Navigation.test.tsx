import { render, screen } from '@testing-library/react'
import { Navigation } from '@/components/Navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('Navigation', () => {
  it('renders navigation menu', () => {
    render(<Navigation />)
    
    // Check if main navigation items are present
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('shows user menu when authenticated', () => {
    // Mock authenticated state
    jest.mocked(require('@clerk/nextjs')).useAuth.mockReturnValue({
      userId: 'test-user-id',
      isLoaded: true,
      isSignedIn: true,
    })

    render(<Navigation />)
    
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })

  it('shows sign in button when not authenticated', () => {
    // Mock unauthenticated state
    jest.mocked(require('@clerk/nextjs')).useAuth.mockReturnValue({
      userId: null,
      isLoaded: true,
      isSignedIn: false,
    })

    render(<Navigation />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})