'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Auto-recover from stale chunk errors by hard-reloading
    if (
      error?.message?.includes('ChunkLoadError') ||
      error?.message?.includes('Loading chunk')
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <p>{error?.message}</p>
      <button onClick={() => reset()} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  );
}
