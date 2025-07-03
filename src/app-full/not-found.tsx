import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">404</h2>
        <p className="text-xl text-gray-400 mb-6">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}