'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: 'ri-user-line' },
  { id: 2, title: 'Company Details', icon: 'ri-building-line' },
  { id: 3, title: 'Security', icon: 'ri-shield-keyhole-line' },
  { id: 4, title: 'Review', icon: 'ri-check-double-line' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 border-blue-600'
                    : isActive
                    ? 'bg-[#0f172a] border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-[#0f172a] border-white/10'
                }`}
              >
                {isCompleted ? (
                  <i className="ri-check-line text-white text-sm" />
                ) : (
                  <i className={`${step.icon} ${isActive ? 'text-blue-400' : 'text-gray-500'} text-sm`} />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-blue-400' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedCard({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  return (
    <div
      key={stepKey}
      className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-fadeSlide"
    >
      {children}
    </div>
  );
}

const inputBase =
  'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputError = 'border-red-500/50';
const inputNormal = 'border-white/10';

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${error ? inputError : inputNormal}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

export default function OpsSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const updateField = useCallback((name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (s: number): boolean => {
      const nextErrors: Record<string, string> = {};
      if (s === 1) {
        if (!form.firstName.trim()) nextErrors.firstName = 'First name is required';
        if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required';
      }
      if (s === 2) {
        if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required';
        if (!form.email.trim()) nextErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
      }
      if (s === 3) {
        const passwordError = validatePassword(form.password);
        if (passwordError) nextErrors.password = passwordError;
        if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
        if (!form.agreeTerms) nextErrors.agreeTerms = 'You must agree to the terms';
      }
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    },
    [form]
  );

  const goNext = useCallback(() => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length));
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
    setSubmitError('');
  }, []);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsLoading(true);
    setSubmitError('');
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName, form.companyName, form.phone, form.companySize);
    if (error) {
      setSubmitError(error.message || 'Something went wrong');
      setIsLoading(false);
    } else {
      router.push('/dashboard/setup-wizard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide { animation: fadeSlide 0.35s ease-out both; }
      `}</style>

      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer flex items-center gap-1">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line" />
            </div>
            Back to home
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-check-line text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-pacifico)' }}>
            GuardianHub
          </h1>
          <p className="text-gray-400 text-sm">Create your operations account</p>
        </div>

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <AnimatedCard stepKey={1}>
            <h2 className="text-lg font-semibold text-white mb-1">Who&apos;s setting up the account?</h2>
            <p className="text-sm text-gray-400 mb-5">We need a few details about you to get started.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" name="firstName" placeholder="John" required value={form.firstName} error={errors.firstName} onChange={(v) => updateField('firstName', v)} />
                <Field label="Last Name" name="lastName" placeholder="Smith" required value={form.lastName} error={errors.lastName} onChange={(v) => updateField('lastName', v)} />
              </div>
              <Field label="Phone Number" name="phone" type="tel" placeholder="+44 7700 900000" value={form.phone} error={errors.phone} onChange={(v) => updateField('phone', v)} />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                Next <i className="ri-arrow-right-line" />
              </button>
            </div>
          </AnimatedCard>
        )}

        {step === 2 && (
          <AnimatedCard stepKey={2}>
            <h2 className="text-lg font-semibold text-white mb-1">Tell us about your company</h2>
            <p className="text-sm text-gray-400 mb-5">This helps us tailor your dashboard experience.</p>
            <div className="space-y-4">
              <Field label="Company Name" name="companyName" placeholder="SecureOps Ltd" required value={form.companyName} error={errors.companyName} onChange={(v) => updateField('companyName', v)} />
              <Field label="Work Email" name="email" type="email" placeholder="you@company.com" required value={form.email} error={errors.email} onChange={(v) => updateField('email', v)} />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1-10', '11-50', '50+'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateField('companySize', size)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                        form.companySize === size
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={goBack}
                className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-arrow-left-line" /> Back
              </button>
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                Next <i className="ri-arrow-right-line" />
              </button>
            </div>
          </AnimatedCard>
        )}

        {step === 3 && (
          <AnimatedCard stepKey={3}>
            <h2 className="text-lg font-semibold text-white mb-1">Secure your account</h2>
            <p className="text-sm text-gray-400 mb-5">Create a strong password to protect your operations data.</p>
            <div className="space-y-4">
              <Field label="Password" name="password" type="password" placeholder="Min 8 chars, upper, lower, number" required value={form.password} error={errors.password} onChange={(v) => updateField('password', v)} />
              <div className="text-xs text-gray-500 -mt-2">
                Must be at least 8 characters with uppercase, lowercase, and a number.
              </div>
              <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" required value={form.confirmPassword} error={errors.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} />

              <div className="mt-2">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateField('agreeTerms', !form.agreeTerms)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      form.agreeTerms ? 'bg-blue-600 border-blue-600' : 'bg-white/5 border-white/20'
                    }`}
                  >
                    {form.agreeTerms && <i className="ri-check-line text-white text-xs" />}
                  </button>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
                {errors.agreeTerms && <p className="mt-1.5 text-xs text-red-400">{errors.agreeTerms}</p>}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={goBack}
                className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-arrow-left-line" /> Back
              </button>
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                Review <i className="ri-arrow-right-line" />
              </button>
            </div>
          </AnimatedCard>
        )}

        {step === 4 && (
          <AnimatedCard stepKey={4}>
            <h2 className="text-lg font-semibold text-white mb-1">Review your details</h2>
            <p className="text-sm text-gray-400 mb-5">Double-check everything before we create your account.</p>

            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Info</span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="text-white font-medium">
                      {form.firstName} {form.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-white font-medium">{form.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</span>
                  <button
                    onClick={() => setStep(2)}
                    className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Company Name</p>
                    <p className="text-white font-medium">{form.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Size</p>
                    <p className="text-white font-medium">{form.companySize || 'Not selected'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Email</p>
                    <p className="text-white font-medium">{form.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Security</span>
                  <button
                    onClick={() => setStep(3)}
                    className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Password</p>
                  <p className="text-white font-medium">{'\u2022'.repeat(Math.min(form.password.length, 12))}</p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={goBack}
                className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-arrow-left-line" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    Create Account <i className="ri-check-line" />
                  </>
                )}
              </button>
            </div>
          </AnimatedCard>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/ops/login" className="text-blue-400 hover:text-blue-300 cursor-pointer">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}