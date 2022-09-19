import React, {useRef, useState} from 'react';
import { useAuth } from '../../contexts/AuthContext'
import {useNavigate} from 'react-router-dom'

export default function ForgotPassword() {
  const emailRef = useRef()
  const navigate = useNavigate()
  const {resetPassword} = useAuth()

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        
        setError("")
        setMessage("")
        setLoading(true)
        await resetPassword(emailRef.current.value)
        .then(() => setMessage('Check your inbox for further instructions!'))
        .catch(err => setError(err.message))
        setLoading(false)
    }

  return (
  <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500">
    <div className="max-w-md w-full space-y-8 ">
      <div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
        </p>
      </div>
      {error && <div role="alert">
        <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
            Error
        </div>
        <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
            <p>{error}</p>
        </div>
      </div>}
      {message && <div role="alert">
        <div className="bg-green-400 text-white font-bold rounded-t px-4 py-2">
            Thank You!
        </div>
        <div className="border border-t-0 border-green-400 rounded-b bg-green-100 px-4 py-3 text-green-700">
            <p>{message}</p>
        </div>
      </div>}
      <form className="mt-8 space-y-6" action="#" onSubmit={handleSubmit}>
        <input type="hidden" name="remember" defaultValue="true" />
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              ref={emailRef}
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled = {loading || message}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              {/* <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" /> */}
            </span>
            Reset Password
          </button>
        </div>

        <div>
            <p className="mt-2 text-center text-sm text-gray-600">
            Remember now?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in here!
            </a>
            </p>
        </div>

      </form>
    </div>
  </div>
  )

}