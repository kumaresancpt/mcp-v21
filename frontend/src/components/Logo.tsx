import React from 'react'

/**
 * Logo — matches Figma node 40:5200 (313 × 73.5 px, fixed layout).
 * All child elements are absolutely positioned to match the Figma pixel values.
 *   Shield icon  : Figma asset 26692da2-cfa3-4d88-b302-6c611347679c
 *   CPT logo     : Figma asset 5852a200-e19d-4046-8075-d8e5efdee71d
 */
const Logo: React.FC = () => (
  <div style={{ position: 'relative', width: '313px', height: '73.5px' }}>
    {/* Shield / visitor icon image */}
    <img
      src="https://www.figma.com/api/mcp/asset/26692da2-cfa3-4d88-b302-6c611347679c"
      alt="Visitor shield icon"
      style={{
        position: 'absolute',
        left: 0,
        top: '3.46px',
        width: '56.18px',
        height: '66.6px',
        objectFit: 'contain',
      }}
    />

    {/* "VISITOR" wordmark */}
    <span
      style={{
        position: 'absolute',
        left: '65.71px',
        top: '8.65px',
        fontFamily: 'Satoshi, Inter, sans-serif',
        fontWeight: 900,
        fontSize: '31.127px',
        color: '#5B21B6',
        whiteSpace: 'nowrap',
        lineHeight: 'normal',
      }}
    >
      VISITOR
    </span>

    {/* "Powered by" + Changepond logo */}
    <div
      style={{
        position: 'absolute',
        left: '65.71px',
        top: '48.42px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontFamily: 'Satoshi, Inter, sans-serif',
          fontWeight: 500,
          fontSize: '12.105px',
          color: '#000000',
          lineHeight: 'normal',
        }}
      >
        Powered by
      </span>
      <img
        src="https://www.figma.com/api/mcp/asset/5852a200-e19d-4046-8075-d8e5efdee71d"
        alt="CHANGEPOND"
        style={{
          height: '18.157px',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  </div>
)

export default Logo
