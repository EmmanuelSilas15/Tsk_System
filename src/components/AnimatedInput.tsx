'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface AnimatedInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: 'mail' | 'lock';
  autoComplete?: string;
  required?: boolean;
}

export default function AnimatedInput({
  type,
  placeholder,
  value,
  onChange,
  icon = 'mail',
  autoComplete,
  required = false,
}: AnimatedInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getIcon = () => {
    switch (icon) {
      case 'mail':
        return <Mail className="w-5 h-5" />;
      case 'lock':
        return <Lock className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative mb-6"
    >
      <div className="relative">
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
          isFocused ? 'text-blue-500' : 'text-gray-400'
        } transition-colors duration-300`}>
          {getIcon()}
        </div>
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-12 pr-10 py-4 bg-white dark:bg-gray-800 rounded-xl border-2 ${
            isFocused 
              ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
              : 'border-gray-200 dark:border-gray-700'
          } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all duration-300`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}