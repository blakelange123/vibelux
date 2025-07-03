export default function TestDeployPage() {
  return (
    <div>
      <h1>Test Deploy Page</h1>
      <p>This is a minimal page to test Vercel deployment.</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Has Database URL: {!!process.env.DATABASE_URL ? 'Yes' : 'No'}</p>
      <p>Has Redis URL: {!!process.env.REDIS_URL ? 'Yes' : 'No'}</p>
    </div>
  )
}