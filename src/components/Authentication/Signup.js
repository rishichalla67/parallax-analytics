import React, {useRef, useState, useEffect} from 'react';
import { LockClosedIcon } from '@heroicons/react/solid'
import { useAuth } from '../../contexts/AuthContext'
import {useNavigate} from 'react-router-dom'
import {db} from '../../firebase'
import {User} from '../../Classes/User'

export default function Signup() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const usernameRef = useRef()
  const {signup} = useAuth()
  const [allUsernames, setAllUsers] = useState()
  const navigate = useNavigate()

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [usernameTaken, setUsernameTaken] = useState('white')

  async function fetchAllUsers(){
    const snapshot = await db.collection("users").get()
    if(snapshot.docs.length > 0){
      const tempUsers = []
      snapshot.docs.forEach((user)=>{
        tempUsers.push(user.data().username?user.data().username:''
      )
      })
      setAllUsers(tempUsers) 
    }
  }

  useEffect(() => {
    if(!allUsernames){
      fetchAllUsers()
    }
  })

  const createUser = (emailValue, usernameValue) => {
    db.collection("users").add({
      email: emailValue,
      username: usernameValue 
    }).then((docRef) => {
      db.collection("users").doc(docRef.id).update(User(docRef.id))
  })
    .catch(err => setError(err.message));
  }

  const validateUsername = (e) => {
    const usernameToValidate = e.target.value.toLowerCase()
    if(allUsernames.includes("@"+usernameToValidate)){
      setUsernameTaken("red-400")
      setError(`@${usernameToValidate} is taken, please choose another`)
    }else{
      setUsernameTaken("white")
      if(error.includes("@")){
        setError("")
      }
    }
    
  }

    async function handleSubmit(e) {
        e.preventDefault()
        
        const usernameInput = "@"+usernameRef.current.value.toLowerCase()

        // Validation
        if(allUsernames.includes(usernameInput)){
          return setError("Sorry. " + usernameInput + " is taken. Please try another username!")
        }
        if(passwordRef.current.value !== passwordConfirmRef.current.value){
            return setError("Passwords do not match!")
        }
        

        setError("")
        setLoading(true)
        await signup(emailRef.current.value, passwordRef.current.value)
        .then(() => {
          createUser(emailRef.current.value, usernameInput)
          navigate('/')
        })
        .catch(err => setError(err.message))
        
        setLoading(false)
    }

    if(allUsernames === undefined){
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full" role="status">
            <span className="visually-hidden"></span>
          </div>
        </div>
      )
    }

  return (
  <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-300">
    <div className="max-w-md w-full space-y-8 ">
      <div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">Sign Up</h2>
      </div>
      {error && <div role="alert">
        <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
            Error
        </div>
        <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
            <p>{error}</p>
        </div>
      </div>}
      <form className="mt-8 space-y-6" action="#" onSubmit={handleSubmit}>
        <input type="hidden" name="remember" defaultValue="true" />
        <div className="rounded-md shadow-sm -space-y-px">
        <div>
            <label htmlFor="username-signup" className="sr-only">
              Username
            </label>
            <input
              id="username"
              ref={usernameRef}
              onChange={validateUsername}
              required
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border bg-${usernameTaken} border-gray-30 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              placeholder="Username"
            />
          </div>
          <div className="pt-2">
            <label htmlFor="email-address-signup" className="sr-only">
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
          <div className="pt-2">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              ref={passwordRef}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div className="pt-2">
            <label htmlFor="password-confirmation" className="sr-only">
              Password Confirmation
            </label>
            <input
              id="password-confirmation"
              name="password-confirmation"
              type="password"
              ref={passwordConfirmRef}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
            />
          </div>
        </div>

        <div>
            <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in here!
            </a>
            </p>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled = {loading}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
            </span>
            Sign Up
          </button>
        </div>
      </form>
    </div>
  </div>
  )

}