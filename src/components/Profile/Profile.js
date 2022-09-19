import React, { useEffect, useState } from "react";
import Nav from "../Nav";
import { useFirestore } from "../../contexts/FirestoreContext";
import EditProfile from "./EditProfile";

export default function Profile() {
  const { activeUser, refreshUser } = useFirestore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [updatedPhoto, setUpdatedPhoto] = useState("");

  const handleSave = (url) => {
    setUpdatedPhoto(url);
    setShowEditProfile(false);
  };

  useEffect(() => {
    if (activeUser.id) {
      console.log(updatedPhoto);
      refreshUser(activeUser.id);
    }
  }, [updatedPhoto]);

  if (!activeUser.id) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div
          className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full"
          role="status"
        >
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <Nav />
        {!showEditProfile && (
          <div className="pt-4 pb-5 flex justify-center">
            <div className="w-[95%] md:w-[75%]  h-full pb-3 flex flex-col justify-center bg-slate-100 rounded-lg border border-slate-500 shadow-lg items-center ">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  Profile
                </h3>
              </div>
              <div className="w-[95%] border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center justify-center">
                      Profile Picture
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center justify-center">
                      {updatedPhoto ? (
                        <img className="h-40 w-40 " src={updatedPhoto} alt="" />
                      ) : (
                        <img
                          className="h-40 w-40 "
                          disabled={activeUser.photo === ""}
                          src={activeUser.photo}
                          alt=""
                        />
                      )}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {activeUser.firstName} {activeUser.lastName}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {activeUser.email}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowEditProfile(true);
                  }}
                  className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-med font-medium rounded-md text-white bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
        {showEditProfile && (
          <EditProfile handleSave={handleSave} activePhotoURL={updatedPhoto} />
        )}
      </div>
    </>
  );
}
