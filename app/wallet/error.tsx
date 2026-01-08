'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WalletError({ error, reset }: ErrorProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFDF5',
      color: '#2D3436',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      paddingTop: '112px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '50%',
            padding: '24px'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Oops!</h1>
        <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '32px' }}>
          Something went wrong with your wallet.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <button onClick={reset} style={{
            padding: '12px 24px',
            background: '#2D3436',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            minWidth: '200px'
          }}>Try Again</button>
          <a href="/" style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#2D3436',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            minWidth: '200px'
          }}>Go Home</a>
        </div>
      </div>
    </div>
  );
}
