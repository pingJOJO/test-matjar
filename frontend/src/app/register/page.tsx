'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, Tag } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolveSafeRedirect = () => {
    const rawRedirect = searchParams.get('redirect');
    if (!rawRedirect || rawRedirect.startsWith('/admin')) {
      return '/';
    }
    return rawRedirect;
  };

  const { register: registerUser, error: authError, clearError } = useAuthStore();
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError(isAr ? 'يرجى ملء الحقول المطلوبة' : 'Please provide all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setFormError(isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setFormError(isAr ? 'يجب أن لا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await registerUser({
        email: email.trim(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      if (ok) {
        router.push(resolveSafeRedirect());
      }
    } catch (err: any) {
      setFormError(err?.message || (isAr ? 'حدث خطأ أثناء التسجيل' : 'Registration failed.'));
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
      <div className="max-w-[480px] w-full p-8 bg-white rounded-lg border border-slate-200 shadow-sm animate-in fade-in duration-200">
        {/* Promotional Welcome Banner */}
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#B45309] text-xs font-bold w-full justify-center">
          <Tag className="h-3.5 w-3.5" />
          <span>{isAr ? 'سجل الآن واحصل على قسيمة خصم بقيمة 5$' : 'New Customer Welcome: US$5 Off Your First Order'}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">
          {isAr ? 'إنشاء حساب جديد' : 'Create a New Account'}
        </h1>

        {/* Error Notification */}
        {(formError || authError) && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'الاسم الأول' : 'First Name'}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-[#0D5CB6] focus:ring-2 focus:ring-[#0D5CB6]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? 'اسم العائلة' : 'Last Name'}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-[#0D5CB6] focus:ring-2 focus:ring-[#0D5CB6]/30"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-[#0D5CB6] focus:ring-2 focus:ring-[#0D5CB6]/30"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? 'كلمة المرور * (8 خانات على الأقل)' : 'Password * (min. 8 characters)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 px-3.5 pe-10 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-[#0D5CB6] focus:ring-2 focus:ring-[#0D5CB6]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isAr ? 'left-3' : 'right-3'
                } text-slate-400 hover:text-slate-600 cursor-pointer p-1`}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Legal Notice */}
          <p className="text-[12px] text-slate-500 text-center leading-relaxed pt-1">
            {isAr
              ? 'بإنشاء الحساب، فإنك توافق على الشروط والأحكام وسياسة الخصوصية الخاصة بـ A2Z Parts.'
              : "By creating an account, you agree to A2Z Parts' Terms & Conditions and Privacy Policy."}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-[#FFB800] hover:bg-[#F0AA00] text-slate-950 font-bold text-sm tracking-wider uppercase flex items-center justify-center transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
            ) : isAr ? (
              'إنشاء الحساب'
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Google Sign In */}
        <GoogleAuthButton
          label={isAr ? 'التسجيل باستخدام Google' : 'Sign up with Google'}
          onSuccess={handleGoogleSuccess}
          onError={(msg) => setFormError(msg)}
        />

        {/* Already have an account link */}
        <div className="mt-6 text-center text-xs text-slate-600">
          <span>{isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}</span>
          <Link href="/login" className="font-bold text-[#0D5CB6] hover:underline">
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D5CB6]" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
