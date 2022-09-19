import React, {useEffect, useState} from 'react'
import Nav from './Nav'
import { useAuth } from '../contexts/AuthContext'
import {db} from '../firebase'


export default function Profile() {
  const {currentUser} = useAuth()
  const [user, setUser] = useState([])

  useEffect(() => {
    getUsers()    
  }, [])

  const getUsers=async()=>{
    const response=db.collection('users');
    const data=await response.get();
    data.docs.forEach(item=>{
      if(item.data().email === currentUser.email){
        setUser(item.data())
      }
    })
    
  }


  return (
    <>
        <Nav/>
        <div className="pt-10 grid place-items-center">
          <div className="p-3 md:max-w-5xl bg-slate-100 rounded-lg border border-slate-500 shadow-lg items-center ">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">Profile</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.firstName} {user.lastName}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.bio}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.street} {user.city}, {user.state} {user.zip} {user.country}</dd>
                </div>
              </dl>
            </div>
            <div className="pt-2">
                    <a href="/edit-profile" className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-med font-medium rounded-md text-white bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900">
                      Edit
                    </a>
                    </div>
          </div>
          
        </div>
        
    </>
  )
}
