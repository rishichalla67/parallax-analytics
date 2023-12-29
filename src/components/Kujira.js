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
        
        {isLoading ? (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        ) : kujiraData && (
            <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold mb-4">Ghost</h3>
                <div className="overflow-x-auto pb-2">
                    <table className="table-auto text-left whitespace-no-wrap">
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="px-4 py-2">xAsset</th>
                                <th className="px-4 py-2">Value</th>
                            </tr>
                        </thead>
                        <tbody className="bg-black">
                            {Object.entries(kujiraData).map(([key, value]) => {
                                const displayKey = key.includes('/u') ? key.substring(key.lastIndexOf('/u') + 2) : key;
                                return (
                                    <tr className="hover:bg-slate-600" key={key}>
                                        <td className="border px-4 py-2">{displayKey}</td>
                                        <td className="border px-4 py-2">{value}</td>
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



