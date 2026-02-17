import { useState } from 'react'
import { Link } from '@inertiajs/react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setErrors({})

    try {
      // Laravel expects CSRF cookie if you're using Sanctum; for normal web auth,
      // axios will send XSRF if cookies are present. Usually OK in same domain.
      await axios.post('/login', { email, password, remember })
      window.location.href = '/dashboard'
    } catch (err) {
      // Laravel validation errors often come like: err.response.data.errors
      const resErrors = err?.response?.data?.errors
      setErrors(resErrors || { general: 'Invalid credentials or server error.' })
    } finally {
      setProcessing(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 py-7 border-b border-slate-200 bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
                CR
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Capstone Repository</h1>
                <p className="text-sm text-white/70">Sign in to continue</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {errors.general && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="name@school.edu"
                  autoComplete="username"
                  required
                />
                {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-slate-600 hover:text-slate-900 transition">
                    Forgot password?
                  </Link>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                {errors.password && <p className="mt-2 text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                />
                Remember me
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processing ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="pt-2 text-center text-xs text-slate-500">
                Authorized personnel only.
              </p>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition">
            ← Back to portal
          </Link>
        </div>
      </div>
    </div>
  )
}
