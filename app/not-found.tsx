export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFDF5',
      color: '#2D3436',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      paddingTop: '128px',
      paddingBottom: '64px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '50%',
            padding: '24px',
            display: 'inline-flex'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
            404
          </h1>
          <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', letterSpacing: '0.1em' }}>
            PAGE NOT FOUND
          </p>
          <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '16px' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Suggestions */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', fontWeight: '600' }}>
            You might want to visit:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '14px'
          }}>
            <a href="/shop" style={{
              color: '#2D3436',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              → Shop
            </a>
            <a href="/wallet" style={{
              color: '#2D3436',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              → Wallet
            </a>
            <a href="/events/upcoming" style={{
              color: '#2D3436',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              → Events
            </a>
            <a href="/community" style={{
              color: '#2D3436',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              → Community
            </a>
          </div>
        </div>

        {/* Action */}
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 32px',
            background: '#2D3436',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go Home
        </a>
      </div>
    </div>
  );
}
