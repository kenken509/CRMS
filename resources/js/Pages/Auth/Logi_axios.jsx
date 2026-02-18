import { useState } from 'react'
import { Link } from '@inertiajs/react'
import axios from 'axios'
import { IoHomeOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"
import { HiOutlineAcademicCap } from "react-icons/hi2"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setErrors({})

    try {
      await axios.post('/login', { email, password, remember })
      window.location.href = '/dashboard'
    } catch (err) {
      const resErrors = err?.response?.data?.errors
      setErrors(resErrors || { general: 'Invalid credentials or server error.' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-8 py-7 bg-primary">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <HiOutlineAcademicCap className="text-2xl" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Capstone Repository
                </h1>
                <p className="text-sm text-white/80">
                  Sign in to continue
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">

            {errors.general && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                  placeholder="name@school.edu"
                  autoComplete="username"
                  required
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-secondary transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />

                  {/* Toggle Icon */}
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-primary transition"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="text-lg hover:cursor-pointer" />
                    ) : (
                      <IoEyeOutline className="text-lg hover:cursor-pointer" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2 text-sm text-slate-600 hover:cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-[--color-primary]/20 hover:cursor-pointer"
                />
                Remember me
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                {processing ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="pt-2 text-center text-xs text-slate-500">
                Authorized personnel only.
              </p>

            </form>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-primary transition flex justify-center items-center gap-1"
          >
            <IoHomeOutline className="text-lg" />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Capstone Repository Management System
          <span className="mx-1 text-slate-300">•</span>
          <span className="text-accent font-semibold">v1.0</span>
        </p>

      </div>
    </div>
  )
}
