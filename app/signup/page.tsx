/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import FloatingBackground from '../../src/components/FloatingBackground';
import AnimatedLayout from '../../src/components/AnimatedLayout';
import AnimatedButton from '../../src/components/AnimatedButton';
import { Toast } from '../../src/components/Toast';
import { supabase } from '@/supabase/supabaseClient';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({
      id: Date.now().toString(),
      message,
      type,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords don't match!", 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: { full_name: formData.name },
        },
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();

        if (
          msg.includes("already") ||
          msg.includes("registered") ||
          msg.includes("exists")
        ) {
          showToast("This email already has an account. Please login instead.", 'error');
          return;
        }

        throw error;
      }

      // ✅ If email confirmation is ON, user may be null until confirmed
      if (!data.user) {
        showToast("Check your email to confirm your account, then login.", 'info');
      } else {
        showToast("Account created successfully! You can now login.", 'success');
      }

      // ✅ Clear form after successful signup
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      showToast(err?.message ?? "Signup failed. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 relative overflow-hidden">
      <FloatingBackground />
      
      {/* Toast Notification */}
      <Toast 
        toast={toast} 
        onClose={() => setToast(null)}
        duration={4000}
      />

      <AnimatedLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create Account
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Join us and start your journey
            </p>
          </div>

          {/* ✅ use handleSignup */}
          <form onSubmit={handleSignup}>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 py-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 py-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 py-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 py-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <AnimatedButton type="submit" loading={loading} variant="secondary">
              {loading ? 'Creating Account...' : 'Create Account'}
            </AnimatedButton>

            <div className="text-center mt-6">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </AnimatedLayout>
    </div>
  );
}
