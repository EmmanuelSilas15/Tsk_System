'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import FloatingBackground from '../../src/components/FloatingBackground';
import AnimatedLayout from '../../src/components/AnimatedLayout';
import AnimatedInput from '../../src/components/AnimatedInput';
import AnimatedButton from '../../src/components/AnimatedButton';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', formData);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-hidden">
      <FloatingBackground />
      
      <AnimatedLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatedInput
              type="email"
              icon="mail"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <AnimatedInput
              type="password"
              icon="lock"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <AnimatedButton type="submit" loading={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </AnimatedButton>

            <div className="text-center mt-8">
              <p className="text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </AnimatedLayout>
    </div>
  );
}