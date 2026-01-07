'use client';

import { useEffect } from 'react';
import { AlertCircle, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Joy Juncture</title>
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#FFFDF5',
        color: '#2D3436'
      }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                padding: '24px',
                display: 'inline-flex'
              }}>
                <AlertCircle width={48} height={48} style={{ color: '#ef4444' }} />
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
                Oops!
              </h1>
              <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '16px' }}>
                Something went wrong. Please try refreshing the page.
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
                    wordBreak: 'break-all'
                  }}>
                    {error.message || 'Unknown error'}
                  </p>
                  {error.digest && (
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(248, 113, 113, 0.7)',
                      fontFamily: 'monospace',
                      marginTop: '8px'
                    }}>
                      ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#2D3436',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Home width={20} height={20} />
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
