'use client';

export default function DebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <h2>Client-side (NEXT_PUBLIC_*)</h2>
      <ul>
        <li>NEXT_PUBLIC_WAHOO_CLIENT_ID: {process.env.NEXT_PUBLIC_WAHOO_CLIENT_ID || 'NOT SET'}</li>
        <li>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}</li>
      </ul>
      
      <h2>Server-side (will show in network tab)</h2>
      <p>Check the network tab for the /api/debug response</p>
      
      <a href="/">← Back to Main App</a>
    </div>
  );
}
