import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useFirestore } from "../contexts/FirestoreContext";

export default function Home() {
  const { activeUser } = useFirestore();

  return (
    <>
      <div className="min-h-full">
        <Nav />
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ">
            <h1 className="text-3xl font-bold text-gray-900">Home Feed</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 font-bold">
            Hey {activeUser.username}!
          </div>
          <div>The Feed is still in development,</div>
          <div>please feel free to test other functionality!</div>
        </main>
      </div>
    </>
  );
}
