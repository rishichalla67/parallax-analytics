import React, { useState, useEffect, useRef } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";

import Nav from "../Nav.js";
import { Analyics, calculatePnl, formatSymbol } from "./Analytics";
import UpdatePosition from "./UpdatePosition";
import NewPortfolio from "./NewPortfolio";
import AddPosition from "./AddPosition";
import Chart from "./Chart";

export function calculatePositionValue(nomicsTickers, position) {
  if (nomicsTickers[position.symbol] !== undefined) {
    return (
      parseFloat(position.quantity) *
      parseFloat(nomicsTickers[position.symbol].usd)
    ).toFixed(2);
  }
}

export function addCommaToNumberString(number) {
  if (number === null) {
    return '-';
  }

  let numberString = number.toString();
  if (numberString.indexOf(".") !== -1) {
    let parts = numberString.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  } else {
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}



export function maskNumber(input) {
  if (typeof input === "number")
    return input.toString().replace(/[\d\.]/g, "*");
  else if (typeof input === "string") return input.replace(/[\d\.\-]/g, "*");
  else return "Invalid Input";
}

export default function CryptoPortfolio() {
  let timer = 0;

  const [tabIndex, setTabIndex] = useState(1);

  const [error, setError] = useState("");
  const [selectedPosition, setSelectedPosition] = useState();
  const [successMessage, setSuccessMessage] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState(false);

  const [editPositions, setEditPositions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("crypto");
  const [sortAscending, setSortAscending] = useState(true);

  const {
    nomicsTickers,
    refreshOraclePrices,
    setRefreshAvailable,
    refreshAvailable,
    portfolioValue,
    getPortfolioData,
    portfolioValueHistory,
    portfolioPositions,
    filteredPortfolioValueHistory,
    currentChartDateRange,
    filterDataByDateRange,
    getTickerDailyPnL,
  } = useCryptoOracle();
  const { activeUser, tickerList, fetchAllUsers } = useFirestore();

  useEffect(() => {
    getPortfolioData();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshOraclePrices();
    }, 300000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    filterDataByDateRange(portfolioValueHistory, currentChartDateRange, true);
  }, [currentChartDateRange]);

  const refreshAll = () => {
    if (refreshAvailable) {
      setRefreshAvailable(false);
      refreshOraclePrices().then(getPortfolioData());

      timer = setTimeout(() => {
        setRefreshAvailable(true);
      }, 10000);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(column);
      setSortAscending(true);
    }
  };

  // const sortedPositions = [...portfolioPositions].sort((a, b) => {
  //   if (sortBy === "crypto") {
  //     if (sortOrder === "asc") {
  //       return formatSymbol(tickerList[a.symbol]).localeCompare(
  //         formatSymbol(tickerList[b.symbol])
  //       );
  //     } else {
  //       return formatSymbol(tickerList[b.symbol]).localeCompare(
  //         formatSymbol(tickerList[a.symbol])
  //       );
  //     }
  //   } else {
  //     if (sortOrder === "asc") {
  //       return (
  //         calculatePositionValue(nomicsTickers, a) -
  //         calculatePositionValue(nomicsTickers, b)
  //       );
  //     } else {
  //       return (
  //         calculatePositionValue(nomicsTickers, b) -
  //         calculatePositionValue(nomicsTickers, a)
  //       );
  //     }
  //   }
  // });

  const sortedPositions = [...portfolioPositions].sort((a, b) => {
    switch (sortBy) {
      case "crypto":
        return sortAscending
          ? formatSymbol(tickerList[a.symbol]).localeCompare(
              formatSymbol(tickerList[b.symbol])
            )
          : formatSymbol(tickerList[b.symbol]).localeCompare(
              formatSymbol(tickerList[a.symbol])
            );
      case "value":
        return sortAscending
          ? calculatePositionValue(nomicsTickers, a) -
              calculatePositionValue(nomicsTickers, b)
          : calculatePositionValue(nomicsTickers, b) -
              calculatePositionValue(nomicsTickers, a);
      case "quantity":
        return sortAscending
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;

      default:
        return 0;
    }
  });

  if (!activeUser.id) {
    return (
      <div className="h-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900"></div>
    );
  }

  return (
    <>
      <Nav />
      <div className="h-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <div className="text-white grid place-items-center">
          {activeUser.portfolioID ? (
            <div className="bg-black w-full sm:min-w-95% md:max-w-5xl rounded-lg border border-sky-500 shadow-lg items-center ">
              <div className="flex justify-center px-4 py-1 sm:px-6"></div>
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
              {successMessage && (
                <div
                  role="alert"
                  onClick={() => {
                    setSuccessMessage("");
                  }}
                >
                  <div className="bg-green-500 text-black font-bold rounded-t px-4 py-2">
                    Success!
                  </div>
                  <div className="border border-t-0 border-green-400 rounded-b bg-green-300 px-4 py-3 text-black">
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}
              {showModal && (
                <UpdatePosition
                  selectedPosition={selectedPosition}
                  setShowModal={setShowModal}
                  setSuccessMessage={setSuccessMessage}
                />
              )}

              <div className="flex justify-center pl-20 sm:pl-24 pb-2">
                <h3 className="pt-3 sm:pt-1 flex grow flex-col text-4xl sm:text-5xl leading-6 font-small sm:font-medium">
                  <div
                    className={`${privacyFilter ? "hidden" : "pt-8 sm:pt-0"}`}
                    // ref={portfolioValueRef}
                  >
                    {`$${addCommaToNumberString(portfolioValue)}`}
                  </div>
                  <div
                    className={`${privacyFilter ? "pt-4 sm:pt-0" : "hidden"}`}
                  >{`$${maskNumber(portfolioValue)}`}</div>
                  {filteredPortfolioValueHistory.length > 0 && (
                    <div
                      className={`pl-2 pt-4 text-lg sm:pl-3 pb-1 leading-6 ${
                        calculatePnl(filteredPortfolioValueHistory) > 0
                          ? "text-green-400"
                          : "text-red-500"
                      } `}
                    >
                      {`$${
                        // Get the $ Value of the pnl %
                        privacyFilter
                          ? maskNumber(
                              (
                                (calculatePnl(filteredPortfolioValueHistory) /
                                  100) *
                                filteredPortfolioValueHistory[
                                  filteredPortfolioValueHistory.length - 1
                                ].value
                              )
                                .toFixed(2)
                                .toString()
                            )
                          : addCommaToNumberString(
                              (
                                (calculatePnl(filteredPortfolioValueHistory) /
                                  100) *
                                filteredPortfolioValueHistory[
                                  filteredPortfolioValueHistory.length - 1
                                ].value
                              )
                                .toFixed(2)
                                .toString()
                            )
                      }
                           (${
                             // Get the Pnl as a percentage
                             calculatePnl(filteredPortfolioValueHistory)
                           }%)`}
                    </div>
                  )}
                </h3>

                <div
                  className={`pt-3 flex flex-row ${
                    refreshAvailable ? "" : "disabled"
                  }`}
                >
                  <div className={`pr-2 ${privacyFilter ? "" : "hidden"}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#0092ff"
                      className="w-6 h-6 hover:cursor-pointer"
                      onClick={() => {
                        setPrivacyFilter(!privacyFilter);
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div
                    className={`flex justify-center pb-2 pr-2 ${
                      privacyFilter ? "hidden" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#0092ff"
                      className="w-6 h-6 hover:cursor-pointer"
                      onClick={() => {
                        setPrivacyFilter(!privacyFilter);
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={`${refreshAvailable ? "#0092ff" : "#aec5d6"}`}
                    className={`w-6 h-6 hover:cursor-pointer mr-4`}
                    onClick={() => {
                      refreshAll();
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </div>
              </div>
              <div className={`p-1 sm:p-2`}>
                <Chart privacyFilter={privacyFilter} />
              </div>

              {!editPositions ? (
                <div className="flex flex-col justify-center px-4 pt-2 sm:px-6">
                  <ul className="flex -mt-5 sm:-mt-0 flex-wrap text-lg md:text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    <li className="mr-2">
                      <button
                        onClick={() => {
                          setTabIndex(1);
                        }}
                        aria-current="page"
                        className={`inline-block p-4 ${
                          tabIndex !== 1
                            ? "rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            : "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800"
                        }`}
                      >
                        Positions
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => {
                          setTabIndex(2);
                        }}
                        data-bs-toggle="tooltip"
                        title="Check out some details about your positions! More coming soon..."
                        className={`inline-block p-4 ${
                          tabIndex !== 2
                            ? "rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            : "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
                        }`}
                      >
                        Analytics
                      </button>
                    </li>
                  </ul>

                  {/* Tab Index of 1 === Positions Table */}
                  {tabIndex === 1 && (
                    <>
                      <table className="table-auto w-full bg-black text-white">
                        <thead>
                          <tr className="bg-gradient-to-r from-indigo-900 via-indigo-3500 to-indigo-900 text-white">
                            <th
                              className="px-4 py-2 hover:animate-pulse hover:cursor-pointer"
                              onClick={() => handleSort("crypto")}
                            >
                              Crypto{" "}
                              {sortBy === "crypto" &&
                                (sortAscending ? "(A-Z)" : "(Z-A)")}
                            </th>
                            <th
                              className="px-4 py-2 hover:animate-pulse hover:cursor-pointer"
                              onClick={() => handleSort("quantity")}
                            >
                              Quantity{" "}
                              {sortBy === "quantity" &&
                                (sortAscending ? "↑" : "↓")}
                            </th>
                            <th
                              className="px-4 py-2 hover:animate-pulse hover:cursor-pointer"
                              onClick={() => handleSort("value")}
                            >
                              Value{" "}
                              {sortBy === "value" &&
                                (sortAscending ? "↑" : "↓")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPositions.map((position) => {
                            return (
                              <tr
                                key={`${position.symbol}-${position.quantity}-${position.type}`}
                                className="border-b border-gray-400 hover:bg-purple-900 hover:cursor-pointer"
                                onClick={() => {
                                  setShowModal(true);
                                  setSelectedPosition(position);
                                }}
                              >
                                <td className="px-4 py-2">
                                  {formatSymbol(tickerList[position.symbol])}
                                </td>
                                <td className="py-1 sm:px-4 sm:py-2">
                                  {position.symbol === "bitcoin"
                                    ? privacyFilter.privacyFilter
                                      ? maskNumber(position.quantity.toFixed(4))
                                      : addCommaToNumberString(
                                          position.quantity.toFixed(4)
                                        )
                                    : privacyFilter.privacyFilter
                                    ? maskNumber(position.quantity.toFixed(2))
                                    : addCommaToNumberString(
                                        position.quantity.toFixed(2)
                                      )}
                                </td>
                                <td className="px-4 py-2">
                                  {privacyFilter
                                    ? `$${maskNumber(
                                        calculatePositionValue(
                                          nomicsTickers,
                                          position
                                        )
                                      )}`
                                    : `$${addCommaToNumberString(
                                        calculatePositionValue(
                                          nomicsTickers,
                                          position
                                        )
                                      )}`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="py-5 ">
                        <button
                          className="bg-sky-500 hover:bg-sky-700 text-black font-bold py-2 px-4 rounded"
                          onClick={() => {
                            setEditPositions(true);
                          }}
                        >
                          Add Position
                        </button>
                      </div>
                    </>
                  )}

                  {/* Tab Index of 2 === Positions Table */}
                  {tabIndex === 2 && (
                    <>
                      <div className="w-full sm:text-lg ">
                        <Analyics privacyFilter={privacyFilter} />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <AddPosition
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                  setEditPositions={setEditPositions}
                />
              )}
            </div>
          ) : (
            <NewPortfolio />
          )}
        </div>
      </div>
    </>
  );
}
