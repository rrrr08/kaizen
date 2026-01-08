'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
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
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
            Oops!
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '16px' }}>
            Something went wrong. Our team has been notified.
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
          justifyContent: 'center',
          alignItems: 'center'
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
              fontWeight: '700',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'rgba(45, 52, 54, 0.1)',
              color: '#2D3436',
              border: '1px solid rgba(45, 52, 54, 0.3)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </a>
        </div>

        {/* Support Message */}
        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '32px' }}>
          If this problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
