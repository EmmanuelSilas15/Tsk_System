import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* TSK Auto Logo */}
        <div className="flex flex-col items-center justify-center mb-12">
          {/* Logo Image */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 flex items-center justify-center">
            {/* Fallback background in case image doesn't load */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full opacity-20 blur-xl"></div>
            
            {/* Actual Logo Image */}
            <div className="relative w-56 h-56 md:w-72 md:h-72">
              <Image
                src="/Tsk_logo.png"
                alt="TSK Auto Logo - Buying and Selling Cars Locally and Internationally"
                fill
                className="object-contain rounded-full"
                priority
                sizes="(max-width: 768px) 224px, 288px"
              />
            </div>
          </div>
          
          {/* Brand Name - Still showing as backup */}
          <h1 className="text-5xl md:text-6xl font-bold mb-2 text-white">
            TSK Auto
          </h1>
          
          {/* Tagline as backup */}
          <p className="text-lg text-gray-300 mb-2">
            BUYING AND SELLING CARS
          </p>
          <p className="text-md text-amber-300">
            LOCALLY AND INTERNATIONALLY
          </p>
        </div>

        {/* Buttons Only */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/login"
            className="group relative px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <span className="relative flex items-center justify-center gap-3">
              Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </Link>
          
          <Link
            href="/signup"
            className="group relative px-10 py-5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold text-lg border-2 border-amber-500 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <span className="relative flex items-center justify-center gap-3">
              Sign Up
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}