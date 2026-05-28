import React from 'react'

interface HeroImageProps {
  alt?: string
}

const HeroImage: React.FC<HeroImageProps> = ({ alt = 'Two professionals meeting on a building balcony' }) => {
  const heroImageUrl = 'https://www.figma.com/api/mcp/asset/88daf2be-b006-4e58-85c0-33d78f286b0d'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
      aria-label={alt}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <img
          alt={alt}
          src={heroImageUrl}
          style={{
            position: 'absolute',
            height: '100%',
            left: '-24.21%',
            maxWidth: 'none',
            top: '0.03%',
            width: '98.33%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  )
}

export default HeroImage
