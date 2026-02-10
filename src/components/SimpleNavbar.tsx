import Link from 'next/link';

export default function SimpleNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AnimatedAuth
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}