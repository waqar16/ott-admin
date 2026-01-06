'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

export interface ParentalPINProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPIN?: string;
  title?: string;
  description?: string;
}

export function ParentalPIN({
  isOpen,
  onClose,
  onSuccess,
  correctPIN = '1234', // Default PIN for demo - should be stored securely in production
  title = 'Exit Kids Zone',
  description = 'Enter the parental PIN to continue',
}: ParentalPINProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setPin(['', '', '', '']);
      setError('');
      // Focus first input
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-verify when all digits are entered
    if (newPin.every((digit) => digit !== '') && index === 3) {
      verifyPIN(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    // Handle left/right arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Handle enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      const enteredPIN = pin.join('');
      if (enteredPIN.length === 4) {
        verifyPIN(enteredPIN);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');

    if (digits.length > 0) {
      const newPin = [...pin];
      digits.forEach((digit, index) => {
        if (index < 4) {
          newPin[index] = digit;
        }
      });
      setPin(newPin);
      setError('');

      // Focus the next empty input or last input
      const nextEmptyIndex = newPin.findIndex((d) => d === '');
      const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
      inputRefs[focusIndex].current?.focus();

      // Auto-verify if all digits filled
      if (newPin.every((digit) => digit !== '')) {
        verifyPIN(newPin.join(''));
      }
    }
  };

  const verifyPIN = async (enteredPIN: string) => {
    setIsVerifying(true);
    setError('');

    // Simulate async verification (would be API call in production)
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (enteredPIN === correctPIN) {
      onSuccess();
      // Reset form
      setPin(['', '', '', '']);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }

    setIsVerifying(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPIN = pin.join('');
    if (enteredPIN.length === 4) {
      verifyPIN(enteredPIN);
    }
  };

  const handleCancel = () => {
    setPin(['', '', '', '']);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={handleCancel}
              className="text-white hover:text-gray-200 transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-purple-100">{description}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            {/* PIN Input */}
            <div className="flex justify-center gap-4 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  className={`w-16 h-16 text-center text-3xl font-bold border-2 rounded-lg focus:outline-none focus:ring-4 transition ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-purple-600 focus:ring-purple-200'
                  } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`PIN digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Make sure you're entering the correct 4-digit PIN.
                  </p>
                </div>
              </div>
            )}

            {/* Verification Indicator */}
            {isVerifying && (
              <div className="mb-6 flex items-center justify-center text-purple-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                <span className="font-medium">Verifying...</span>
              </div>
            )}

            {/* Help Text */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-blue-800 text-sm font-medium">Parental Control</p>
                  <p className="text-blue-600 text-sm mt-1">
                    This PIN protects access to content outside the Kids Zone. Contact your account
                    administrator if you need help.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isVerifying}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={pin.some((d) => d === '') || isVerifying}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify PIN'}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Demo PIN: <span className="font-mono font-semibold">1234</span> (for development only)
          </p>
        </div>
      </div>
    </div>
  );
}
