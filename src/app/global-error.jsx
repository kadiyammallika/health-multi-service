'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (
      error?.message?.includes('ChunkLoadError') ||
      error?.message?.includes('Loading chunk')
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <button onClick={() => reset()} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
