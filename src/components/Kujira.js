import React, { useState, useEffect } from "react";


export default function Kujira() {
  const [kujiAddress, setKujiAddress] = useState("kujira17ephyl7pxx7hrauhu6guf62z7nrtszj2dj90nr")
  const [kujiraData, setKujiraData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let forceRefresh = false;

  const env = "prod";
  const serverURL = env === "dev" ? "http://localhost:225" : "https://parallax-analytics.onrender.com";

  const fetchKujiraData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${serverURL}/kujiraGhostBalance?address=${kujiAddress}&forceRefresh=${forceRefresh}`);
      const data = await response.json();
      setKujiraData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Kujira data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
  }, []);


  // Add your component logic here
  return (
    <>
        <p className="pt-2">Please enter your Kujira address</p>
        <div className="flex justify-center items-center p-4">
            <input
                type="text"
                value={kujiAddress}
                onChange={(e) => setKujiAddress(e.target.value)}
                placeholder="Enter your Kujira address"
                className="w-full p-2 border-2 border-sky-500 rounded-md focus:outline-none focus:border-sky-600 bg-slate-800 placeholder-bold"
                style={{ maxWidth: '600px' }}
            />
            <button
                onClick={fetchKujiraData}
                className="ml-2 p-2 border-2 border-sky-500 rounded-md focus:outline-none focus:border-sky-600 bg-slate-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </div>
        <hr className="my-4 border-gray-200" />
        {isLoading ? (
            <div className="flex justify-center items-center h-15%">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        ) : kujiraData && (
            <div className="flex flex-col items-center justify-center shadow-lg rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 text-white">Ghost Initial Deposits</h3>
                <div className="overflow-x-auto pb-2">
                    <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg">
                        <thead className="bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                                    Asset
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                                    Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-700 divide-y divide-gray-200">
                            {Object.entries(kujiraData).map(([key, value]) => {
                                const displayKey = key.includes('/u') ? key.substring(key.lastIndexOf('/u') + 2) : key;
                                return (
                                    <tr className="hover:bg-gray-100" key={key}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{displayKey}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{value}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </>
  );
}



