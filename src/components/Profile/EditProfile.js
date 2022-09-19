import React, { useState, useEffect, useRef } from "react";
import { useFirestore } from "../../contexts/FirestoreContext";
import { db } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const EditProfile = (props) => {
  const bioRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const streetAddressRef = useRef();
  const cityRef = useRef();
  const countryRef = useRef();
  const stateRef = useRef();
  const postalCodeRef = useRef();
  const { activeUser } = useFirestore();
  const storage = getStorage();
  const [error, setError] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedPfp, setUploadedPfp] = useState(null);
  const navigate = useNavigate();

  async function uploadPhoto(photoFile) {
    setLoading(true);
    console.log(photoFile);
    const fileRef = ref(storage, "pfp" + "/" + activeUser.id);
    const uploadedPhoto = await uploadBytes(fileRef, photoFile);
    console.log(uploadedPhoto);
    const url = await getDownloadURL(fileRef);
    setLoading(false);
    return url;
  }

  const updateUser = async (URL) => {
    await db
      .collection("users")
      .doc(activeUser.id)
      .update({
        photo: URL ? URL : activeUser.photo,
        firstName:
          firstNameRef.current.value !== ""
            ? firstNameRef.current.value
            : activeUser.firstName,
        lastName:
          lastNameRef.current.value !== ""
            ? lastNameRef.current.value
            : activeUser.lastName,
      })
      .then(async () => {
        navigate("/profile");
      })
      .catch((err) => setError(err.message));
  };

  async function saveProfile(e) {
    e.preventDefault();

    setError("");
    setLoading(true);
    uploadPhoto(uploadedPfp).then((url) => {
      setPhotoURL(url);
      setLoading(false);
      updateUser(url);
      props.handleSave(url);
    });
  }

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
      {!loading && (
        <div className="pt-10 grid place-items-center">
          <div className="md:max-w-7xl bg-slate-100 rounded-lg border border-slate-500 shadow-lg items-center ">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-gray-900">
                Profile
              </h3>
            </div>
            {error && (
              <div role="alert">
                <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  Error
                </div>
                <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            )}
            <form action="#" onSubmit={saveProfile}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Photo
                    </label>
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                      disabled={loading}
                    >
                      <div className="space-y-1 text-center">
                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden ">
                          {!props.activePhotoURL && (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={activeUser.photo}
                              alt=""
                            />
                          )}
                          {props.activePhotoURL && (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={props.activePhotoURL}
                              alt=""
                            />
                          )}
                        </span>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span className="hidden md:block">
                              Upload a file
                            </span>
                            <span className="pl-6 md:hidden">
                              Upload a file
                            </span>

                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept={[".png", ".jpg", ".gif"]}
                              onChange={(e) => {
                                setUploadedPfp(e.target.files[0]);
                              }}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1 hidden md:block">
                            or drag and drop
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-5 bg-white sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          ref={firstNameRef}
                          placeholder={
                            activeUser.firstName && activeUser.firstName
                          }
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-med font-medium rounded-md text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                    <div className="pt-2">
                      <a
                        href="/profile"
                        className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-med font-medium rounded-md text-white bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>
      )}

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>
    </>
  );
};

EditProfile.propTypes = {
  handleSave: PropTypes.func,
  activePhotoURL: PropTypes.string,
};

export default EditProfile;
