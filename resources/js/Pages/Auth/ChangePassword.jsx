
import { useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import { HiOutlineAcademicCap } from 'react-icons/hi2'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'

const requirements = [
    { label: 'At least 8 characters', test: (value) => value.length >= 8 },
    { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
    { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
    { label: 'One number', test: (value) => /[0-9]/.test(value) },
    { label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

export default function ChangePassword() {
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    const passedRequirements = requirements.filter(
        (item) => item.test(data.password)
    ).length

    const isStrongPassword = passedRequirements === requirements.length
    const passwordsMatch =
        data.password_confirmation.length > 0 &&
        data.password === data.password_confirmation

    const strengthLabel = data.password.length === 0
        ? 'Not set'
        : passedRequirements <= 2
            ? 'Weak'
            : passedRequirements <= 4
                ? 'Moderate'
                : 'Strong'

    const handleSubmit = (e) => {
        e.preventDefault()

        post('/change-password', {
            onSuccess: () => reset(),
        })
    }

    const handleSwitchAccount = () => {
        router.post('/logout')
    }

    const inputClass = `
        w-full rounded-lg border border-slate-200 bg-white
        px-3 py-2.5 pr-10 text-sm text-slate-700
        outline-none transition
        focus:border-primary focus:ring-2 focus:ring-primary/10
    `

    const renderPasswordInput = (
        value,
        onChange,
        visible,
        toggle,
        placeholder,
        autoComplete
    ) => (
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className={inputClass}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
            />
            <button
                type="button"
                onClick={toggle}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700"
            >
                {visible
                    ? <IoEyeOffOutline className="text-lg" />
                    : <IoEyeOutline className="text-lg" />
                }
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-app flex items-center justify-center p-4 lg:p-6">
            <div className="w-full max-w-4xl">

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Header */}
                    <div className="flex items-center gap-3 bg-primary px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                            <HiOutlineAcademicCap className="text-2xl" />
                        </div>

                        <div>
                            <h1 className="text-base font-semibold text-white">
                                Capstone Repository
                            </h1>
                            <p className="text-xs text-white/75">
                                Account Security
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid md:grid-cols-2">

                        {/* Left Panel */}
                        <div className="border-b border-slate-100 bg-slate-50/70 p-6 md:border-b-0 md:border-r lg:p-8">

                            <div className="mb-5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                                    Account Setup
                                </span>

                                <h2 className="mt-2 text-2xl font-bold text-slate-800">
                                    Secure Your Account
                                </h2>

                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    You are currently using your default password.
                                    Create a new password to continue accessing
                                    the Capstone Repository Management System.
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-semibold text-amber-800">
                                    Password Change Required
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-amber-700">
                                    For security reasons, you must update your
                                    default password before proceeding.
                                </p>
                            </div>

                            {/* Password Requirements */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        Password Requirements
                                    </h3>
                                    <span className={`text-xs font-semibold ${
                                        strengthLabel === 'Strong'
                                            ? 'text-emerald-600'
                                            : strengthLabel === 'Moderate'
                                                ? 'text-amber-600'
                                                : 'text-slate-400'
                                    }`}>
                                        {strengthLabel}
                                    </span>
                                </div>

                                {/* Strength Bar */}
                                <div className="mt-2 flex gap-1.5">
                                    {requirements.map((item, index) => (
                                        <div
                                            key={item.label}
                                            className={`h-1.5 flex-1 rounded-full ${
                                                index < passedRequirements
                                                    ? 'bg-emerald-500'
                                                    : 'bg-slate-200'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-2">
                                    {requirements.map((item) => {
                                        const passed = item.test(data.password)

                                        return (
                                            <div
                                                key={item.label}
                                                className="flex items-center gap-2 text-xs"
                                            >
                                                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                                                    passed
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {passed ? '✓' : '•'}
                                                </span>

                                                <span className={
                                                    passed
                                                        ? 'text-emerald-700'
                                                        : 'text-slate-500'
                                                }>
                                                    {item.label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="p-6 lg:p-8">
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Change Your Password
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Enter your current password and create a new one.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Current Password */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Current Password
                                    </label>

                                    {renderPasswordInput(
                                        data.current_password,
                                        (e) => setData('current_password', e.target.value),
                                        showCurrent,
                                        () => setShowCurrent(!showCurrent),
                                        'Enter current password',
                                        'current-password'
                                    )}

                                    {errors.current_password && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.current_password}
                                        </p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        New Password
                                    </label>

                                    {renderPasswordInput(
                                        data.password,
                                        (e) => setData('password', e.target.value),
                                        showNew,
                                        () => setShowNew(!showNew),
                                        'Enter new password',
                                        'new-password'
                                    )}

                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                        Confirm New Password
                                    </label>

                                    {renderPasswordInput(
                                        data.password_confirmation,
                                        (e) => setData('password_confirmation', e.target.value),
                                        showConfirm,
                                        () => setShowConfirm(!showConfirm),
                                        'Confirm new password',
                                        'new-password'
                                    )}

                                    {data.password_confirmation.length > 0 && (
                                        <p className={`mt-1 text-xs ${
                                            passwordsMatch
                                                ? 'text-emerald-600'
                                                : 'text-red-500'
                                        }`}>
                                            {passwordsMatch
                                                ? 'Passwords match.'
                                                : 'Passwords do not match.'}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !isStrongPassword ||
                                        !passwordsMatch ||
                                        !data.current_password
                                    }
                                    className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Updating Password...' : 'Change Password'}
                                </button>

                                <div className="flex items-center gap-3 py-1">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <span className="text-[10px] font-medium text-slate-400">
                                        OR
                                    </span>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSwitchAccount}
                                    className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Switch Account
                                </button>

                                <p className="text-center text-[11px] text-slate-400">
                                    Switching accounts will log you out and return you to the login page.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-[11px] text-slate-400">
                    © {new Date().getFullYear()} Capstone Repository Management System
                </p>
            </div>
        </div>
    )
}
