import React, { useState, useEffect, useRef } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";
import OpenAi from "../OpenAI/openai";

import Nav from "../Nav.js";
import { Analyics, calculateDateBasedPnl, formatSymbol } from "./Analytics";
import UpdatePosition from "./UpdatePosition";
import NewPortfolio from "./NewPortfolio";
import AddPosition from "./AddPosition";
import Chart from "./Chart";
import PortfolioSettings from "./PortfolioSettings";

export function calculatePositionValue(nomicsTickers, position) {
  if (nomicsTickers[position.symbol] !== undefined) {
    return (
      parseFloat(position.quantity) *
      parseFloat(nomicsTickers[position.symbol].usd)
    ).toFixed(2);
  }
}

export function addCommaToNumberString(number) {
  if (number === null || number === undefined) {
    return "-";
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

export function findSymbolPrice(symbol, positionTickerPnLLists) {
  for (let i = 0; i < positionTickerPnLLists.length; i++) {
    const obj = positionTickerPnLLists[i];
    if (obj.id === symbol) {
      return obj.price_change_percentage_24h;
    }
  }
  return null; // Return null if symbol is not found
}

export default function CryptoPortfolio() {
  let timer = 0;

  const [tabIndex, setTabIndex] = useState(1);

  const [error, setError] = useState("");
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState();
  const [successMessage, setSuccessMessage] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState(false);
  const [progress, setProgress] = useState(0);

  const [editPositions, setEditPositions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("value");
  const [sortAscending, setSortAscending] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chatLog, setChatLog] = useState([]);

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
    positionTickerPnLLists,
  } = useCryptoOracle();
  const { activeUser, tickerList, fetchAllUsers } = useFirestore();

  useEffect(() => {
    getPortfolioData();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
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
      }, 60000);
    }
  };

  useEffect(() => {
    if (!isIframeLoaded) {
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress >= 100 ? 0 : prevProgress + 10
        );
      }, 200);
      return () => clearInterval(progressInterval);
    }
  }, [isIframeLoaded]);

  const toggleSettings = () => {
    console.log("showSettings");
    setShowSettingsModal(!showSettingsModal);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(column);
      setSortAscending(true);
    }
  };

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

  function formatLastUpdateAtDate(timestamp) {
    const date = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds
    const now = new Date();

    // Check if the date is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }

    // Check if the date is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return (
        "Yesterday, " +
        date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })
      );
    }

    // Otherwise, return the full date and time
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  if (!activeUser.id) {
    return (
      <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );
  }

  return (
    <>
      <Nav />
      <div className="h-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <div className="text-white grid place-items-center">
          {activeUser.portfolioID ? (
            <div className="bg-black max-w-[26rem] w-full sm:min-w-95% md:max-w-5xl rounded-lg border border-sky-500 shadow-lg items-center ">
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
              {showSettingsModal && (
                <PortfolioSettings
                  sortedPositions={sortedPositions}
                  setShowSettingsModal={setShowSettingsModal}
                />
              )}

              <div className="">
                <coingecko-coin-price-marquee-widget
                  coin-ids={portfolioPositions
                    .map((position) => position.symbol)
                    .join(",")}
                  currency="usd"
                  background-color="#000000"
                  locale="en"
                  font-color="#ffffff"
                  onClick={(e) => e.preventDefault()}
                />
              </div>

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
                      className={`pl-2 sm:pt-3 pt-3 text-lg sm:pl-3 pb-1 leading-6 ${
                        calculateDateBasedPnl(filteredPortfolioValueHistory) > 0
                          ? "text-green-400"
                          : "text-red-500"
                      } `}
                    >
                      {`$${
                        // Get the $ Value of the pnl %
                        privacyFilter
                          ? maskNumber(
                              (
                                (calculateDateBasedPnl(
                                  filteredPortfolioValueHistory
                                ) /
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
                                (calculateDateBasedPnl(
                                  filteredPortfolioValueHistory
                                ) /
                                  100) *
                                filteredPortfolioValueHistory[0].value
                              )
                                .toFixed(2)
                                .toString()
                            )
                      }
                           (${
                             // Get the Pnl as a percentage
                             calculateDateBasedPnl(
                               filteredPortfolioValueHistory
                             )
                           }%)`}
                      <div>
                        {portfolioPositions[0]?.symbol && (
                          <p className="text-xs text-gray-300 opacity-50 pt-1">
                            Last updated:{" "}
                            {formatLastUpdateAtDate(
                              nomicsTickers[portfolioPositions[0]?.symbol]
                                ?.last_updated_at
                            )}
                          </p>
                        )}
                      </div>
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
                    className={`w-6 h-6 hover:cursor-pointer mr-2`}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="#0092ff"
                    class="w-6 h-6"
                    className={`w-6 h-6 hover:cursor-pointer mr-2`}
                    onClick={() => {
                      toggleSettings();
                    }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className={`p-1 sm:p-2`}>
                <Chart privacyFilter={privacyFilter} />
              </div>

              {!editPositions ? (
                <div className="flex flex-col justify-center px-3 pt-2 sm:px-6">
                  <ul className="flex -mt-5 sm:-mt-0 flex-wrap text-sm md:text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
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
                    <li className="mr-2">
                      <button
                        onClick={() => {
                          setTabIndex(3);
                          setIsIframeLoaded(false);
                        }}
                        data-bs-toggle="tooltip"
                        title="Swap any coin seamlessly"
                        className={`inline-block p-4 ${
                          tabIndex !== 3
                            ? "rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            : "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
                        }`}
                      >
                        Swap
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => {
                          setTabIndex(4);
                        }}
                        data-bs-toggle="tooltip"
                        title="Chat with a powerful AI assistant powered by OpenAI"
                        className={`inline-block p-4 ${
                          tabIndex !== 4
                            ? "rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            : "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
                        }`}
                      >
                        Trending
                      </button>
                    </li>
                  </ul>

                  {/* Tab Index of 1 === Positions Table */}
                  {tabIndex === 1 && (
                    <>
                      <table className="table-auto w-full bg-black text-white">
                        <thead>
                          <tr className="bg-gradient-to-r from-indigo-900 to-indigo-900 text-white">
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
                            const assetInfo = positionTickerPnLLists.find(
                              (asset) => asset.id === position.symbol
                            );
                            const image = assetInfo?.image || "";

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
                                  <div className="flex items-center justify-center">
                                    {image && (
                                      <img
                                        src={image}
                                        alt={position.symbol}
                                        className="w-6 h-6 mr-2"
                                      />
                                    )}
                                    {formatSymbol(tickerList[position.symbol])}
                                  </div>
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
                  {tabIndex === 3 && (
                    <>
                      {!isIframeLoaded && (
                        <div className="inset-3 flex items-center justify-center">
                          <div className="w-full max-w-md mx-auto p-4">
                            <div className="bg-gray-200 h-4 rounded-full">
                              <div
                                className="h-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex justify-center w-full py-2 ${
                          !isIframeLoaded ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        <iframe
                          id="simpleswap-frame"
                          name="SimpleSwap Widget"
                          width="100%"
                          height="400rem"
                          src="https://simpleswap.io/widget/a676253b-7475-4ff2-948c-5347c2ab4689"
                          frameborder="0"
                          onLoad={() => setIsIframeLoaded(true)}
                        ></iframe>
                      </div>
                    </>
                  )}
                  {tabIndex === 4 && (
                    <>
                      <OpenAi chatLog={chatLog} setChatLog={setChatLog} />
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
