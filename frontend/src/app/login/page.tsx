'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error: authError, clearError } = useAuthStore();
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const resolveSafeRedirect = () => {
    const rawRedirect = searchParams.get('redirect');
    if (!rawRedirect) return '/';
    if (rawRedirect.startsWith('/admin')) {
      const user = useAuthStore.getState().user;
      return user?.role === 'ADMIN' ? rawRedirect : '/';
    }
    return rawRedirect;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isEmailValid = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please provide both email and password.');
      return;
    }

    if (!isEmailValid) {
      setFormError(isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        router.push(resolveSafeRedirect());
      }
    } catch (err: any) {
      setFormError(err?.message || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push(resolveSafeRedirect());
  };

  return (
    <div
      className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8"
      dir={dir}
    >
      {/* Isolated White Auth Card */}
      <div className="max-w-[480px] w-full p-8 bg-white rounded-lg border border-slate-200 shadow-sm animate-in fade-in duration-200">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">
          {isAr ? 'تسجيل الدخول إلى حسابك' : 'Sign into your account'}
        </h1>

        {/* Error Notification */}
        {(formError || authError) && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError(null);
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="name@company.com"
              required
              className={`w-full h-11 px-3.5 rounded-lg border bg-white text-slate-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#0D5CB6]/30 ${
                emailTouched && !isEmailValid && email.length > 0
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-300 focus:border-[#0D5CB6]'
              }`}
            />
            {emailTouched && !isEmailValid && email.length > 0 && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                {isAr ? 'صيغة البريد الإلكتروني غير صالحة' : 'Invalid email address format'}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'كلمة المرور *' : 'Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="••••••••"
                required
                className="w-full h-11 px-3.5 pe-10 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm transition-all outline-none focus:border-[#0D5CB6] focus:ring-2 focus:ring-[#0D5CB6]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isAr ? 'left-3' : 'right-3'
                } text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-slate-500 hover:text-[#0D5CB6] transition-colors"
            >
              {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </Link>
          </div>

          {/* Legal Disclaimer */}
          <p className="text-[12px] text-slate-500 text-center leading-relaxed pt-1">
            {isAr
              ? 'بتسجيل الدخول، فإنك توافق على الشروط والأحكام وسياسة الخصوصية الخاصة بـ A2Z Parts.'
              : "By signing in, you agree to A2Z Parts' Terms & Conditions and Privacy Policy."}
          </p>

          {/* Solid Yellow Button: SIGN IN */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-bold text-sm tracking-wider uppercase flex items-center justify-center transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
            ) : isAr ? (
              'تسجيل الدخول'
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>

        {/* Outlined Yellow Button: CREATE A NEW ACCOUNT */}
        <div className="mt-3">
          <Link
            href="/register"
            className="w-full h-12 rounded-lg border-2 border-[#FFB800] text-[#B45309] hover:bg-amber-50 font-bold text-sm tracking-wider uppercase flex items-center justify-center transition-colors shadow-xs"
          >
            {isAr ? 'إنشاء حساب جديد' : 'CREATE A NEW ACCOUNT'}
          </Link>
        </div>

        {/* Elegant Divider: OR */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Google Sign In Button */}
        <GoogleAuthButton
          label={isAr ? 'المتابعة باستخدام Google' : 'Google'}
          onSuccess={handleGoogleSuccess}
          onError={(msg) => setFormError(msg)}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D5CB6]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
