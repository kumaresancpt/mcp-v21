import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeroImage from '../components/HeroImage'

describe('HeroImage', () => {
  // Test Case a: Component renders with img element
  it('renders img element inside the component', () => {
    render(<HeroImage />)
    expect(screen.getByAltText('Two professionals meeting on a building balcony')).toBeInTheDocument()
  })

  // Test Case b: Component applies correct Tailwind classes and inline styles for layout
  it('applies correct positioning and layout styles for responsive design', () => {
    const { container } = render(<HeroImage />)
    const img = screen.getByAltText('Two professionals meeting on a building balcony')

    // Verify image is absolutely positioned with correct dimensions
    expect(img).toHaveStyle('position: absolute')
    expect(img).toHaveStyle('height: 100%')
    expect(img).toHaveStyle('objectFit: cover')
  })

  // Test Case c: Image src is set to Figma asset URL
  it('sets image src to correct Figma asset URL', () => {
    render(<HeroImage />)
    const img = screen.getByAltText('Two professionals meeting on a building balcony')

    expect(img).toHaveAttribute('src', 'https://www.figma.com/api/mcp/asset/88daf2be-b006-4e58-85c0-33d78f286b0d')
  })

  // Test Case d: Image alt text is set for accessibility (default or provided)
  it('renders image with alt text for accessibility', () => {
    render(<HeroImage />)
    const img = screen.getByAltText('Two professionals meeting on a building balcony')

    expect(img).toHaveAttribute('alt', 'Two professionals meeting on a building balcony')
  })

  // Test Case e: HeroImage component renders with aria-label on wrapper div
  it('renders wrapper div with aria-label for accessibility', () => {
    render(<HeroImage />)
    const wrapper = screen.getByRole('img').closest('div')

    // Find the parent wrapper with aria-label
    expect(screen.getByLabelText('Two professionals meeting on a building balcony')).toBeInTheDocument()
  })
})
