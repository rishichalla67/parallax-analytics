import React, { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Nav() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [error, setError] = useState();
  // const [notifications, setNotifications] = useState();
  const { activeUser, getActiveUser, allUsers } = useFirestore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getActiveUser();
  }, []);

  async function handleLogout() {
    setError("");
    await logout()
      .then(() => navigate)
      .catch((err) => setError(err.message));
  }

  // Add here for user specific menu

  // Add here for more nav bar tabs
  const navigation = [
    { name: "Portfolio", href: "/", current: true },
    { name: "Profile", href: "/profile" },
    { name: "Sign out", href: "/login", onClick: handleLogout },
  ];

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
      {showModal ? (
        <>
          <Nav />
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative bg-white outline-none focus:outline-none grid place-items-center">
                {/*header*/}
                <div className=" justify-between p-5 border-b border-solid border-slate-200 rounded-t grid place-items-center">
                  <h3 className="text-3xl font-semibold">Notifications</h3>
                </div>
                <div>
                  {activeUser.notifications.map((notif) => {
                    return (
                      <p key={notif.requesterID}>
                        {notif.username}
                        {notif.message}
                      </p>
                    );
                  })}
                </div>
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-slate-500 text-lg leading-relaxed"></p>
                </div>
                {/* </div> */}
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : (
        <Disclosure
          as="nav"
          className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900"
        >
          {({ open }) => (
            <>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid justify-items-stretch">
                <div className="flex items-center justify-self-end h-16">
                  <div className="flex items-center">
                    <div className="flex-shrink-0"></div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-transparent	"
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </>
  );
}
