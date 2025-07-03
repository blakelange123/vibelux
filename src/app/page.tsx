export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>VibeLux - Deployment Test</h1>
      <p>This is a minimal page to test Vercel deployment.</p>
      <p>Build Date: {new Date().toISOString()}</p>
      <h2>Environment Check:</h2>
      <ul>
        <li>NODE_ENV: {process.env.NODE_ENV}</li>
        <li>Database: {process.env.DATABASE_URL ? '✓ Configured' : '✗ Not configured'}</li>
        <li>Redis: {process.env.REDIS_URL ? '✓ Configured' : '✗ Not configured'}</li>
      </ul>
    </div>
  )
}