'use client';

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFDF5',
      color: '#2D3436',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      paddingTop: '112px',
      paddingBottom: '64px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Icon */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(239, 68, 68, 0.2)',
              filter: 'blur(16px)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'relative',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '50%',
              padding: '24px',
              display: 'inline-flex'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
            Oops!
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '16px' }}>
            We couldn't load the shop. Please try again.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(127, 29, 29, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#f87171',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                margin: 0
              }}>
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(248, 113, 113, 0.7)',
                  fontFamily: 'monospace',
                  marginTop: '8px',
                  marginBottom: 0
                }}>
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          justifyContent: 'center'
        }}>
          <button
            onClick={reset}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#2D3436',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <a
            href="/shop"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#2D3436',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            Back to Shop
          </a>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#2D3436',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
