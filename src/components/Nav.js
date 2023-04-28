import React, { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useNavigate } from "react-router-dom";

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

let currentTab = "Portfolio";

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

  function setCurrentTab(current) {
    currentTab = current;
  }

  // Add here for more nav bar tabs
  const navigation = [
    {
      name: "Portfolio",
      href: "/",
      current: currentTab,
      onClick: setCurrentTab("Portfolio"),
    },
    // {
    //   name: "OpenAI",
    //   href: "/openai",
    //   current: currentTab,
    //   onClick: setCurrentTab("OpenAI"),
    // },
    {
      name: "Sign out",
      href: "/login",
      onClick: handleLogout,
      current: currentTab,
    },
  ];

  const notLoggedIn = [
    {
      name: "Sign In",
      href: "/login",
      onClick: setCurrentTab("Sign In"),
    },
  ];

  // Not Logged In (Public User)
  if (!activeUser.id) {
    return (
      <Disclosure
        as="nav"
        className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900"
      >
        {({ open }) => (
          <>
            <div className="px-4 sm:px-6 lg:px-9 grid justify-items-stretch">
              <div className="flex items-center justify-self-end h-16">
                <div className="items-center">
                  <div className="flex-shrink-0"></div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {notLoggedIn.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={`hover:bg-gray-900 text-slate-200 block opacity-80 px-3 py-2 rounded-md text-base font-bold bg-transparent ${
                            item.current === item.name ? "bg-gray-900" : ""
                          }`}
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
                    {/* <span className="sr-only">Open main menu</span> */}
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {notLoggedIn.map((item) => (
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
    );
  }

  return (
    <>
      <Disclosure
        as="nav"
        className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900"
      >
        {({ open }) => (
          <>
            <div className="px-4 sm:px-6 lg:px-9 grid justify-items-stretch">
              <div className="flex items-center justify-self-end h-16">
                <div className="items-center">
                  <div className="flex-shrink-0"></div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={`hover:bg-gray-900 text-slate-200 block opacity-80 px-3 py-2 rounded-md text-base font-bold bg-transparent ${
                            item.current === item.name ? "bg-gray-900" : ""
                          }`}
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
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
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
    </>
  );
}
