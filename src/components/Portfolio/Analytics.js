import React, { useState, useEffect, useMemo } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";
import TickerPriceChart from "./TickerPriceChart";
import {
  addCommaToNumberString,
  maskNumber,
  findSymbolPrice,
} from "./CryptoPortfolio";

export function calculatePnl(data) {
  if (data[0].value) {
    return (
      ((data[data.length - 1].value - data[0].value) /
        data[data.length - 1].value) *
      100
    ).toFixed(2);
  }
}

export function formatSymbol(str) {
  let symbol = "";
  symbol = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return symbol;
}

export function countDigits(num) {
  const str = num.toString(); // Convert number to string
  const decimalIndex = str.indexOf("."); // Find the decimal point index
  const digits = decimalIndex === -1 ? str : str.slice(0, decimalIndex); // Extract digits before decimal
  return digits.length; // Return the length of the extracted digits
}

// let symbolChartData = []

export function Analyics(privacyFilter) {
  const {
    nomicsTickers,
    portfolioPositions,
    positionTickerPnLLists,
    getTickerPriceChart,
  } = useCryptoOracle();
  const { tickerList } = useFirestore();
  const [sortBy, setSortBy] = useState("24hrDelta");
  const [sortAscending, setSortAscending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  // const [symbolChartData, setSymbolChartData] = useState([])
  const cachedTickerPriceChart = useCachedTickerPriceChart(
    positionTickerPnLLists,
    selectedSymbol
  );

  function useCachedTickerPriceChart(positionTickerPnLLists, selectedSymbol) {
    return useMemo(() => {
      const coinData = positionTickerPnLLists.find(
        (obj) => obj.id === selectedSymbol
      );
      return (
        <TickerPriceChart coinData={coinData} setShowModal={setShowModal} />
      );
    }, [positionTickerPnLLists, selectedSymbol]);
  }

  const handleHeaderClick = (header) => {
    if (sortBy === header) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(header);
      setSortAscending(true);
    }
  };

  const sortedPositions = [...portfolioPositions].sort((a, b) => {
    switch (sortBy) {
      case "symbol":
        return sortAscending
          ? formatSymbol(tickerList[a.symbol]).localeCompare(
              formatSymbol(tickerList[b.symbol])
            )
          : formatSymbol(tickerList[b.symbol]).localeCompare(
              formatSymbol(tickerList[a.symbol])
            );
      case "currentPrice":
        return sortAscending
          ? nomicsTickers[a.symbol].usd - nomicsTickers[b.symbol].usd
          : nomicsTickers[b.symbol].usd - nomicsTickers[a.symbol].usd;
      case "avgPrice":
        return sortAscending ? a.avgCost - b.avgCost : b.avgCost - a.avgCost;
      case "quantity":
        return sortAscending
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      case "pnl":
        return sortAscending
          ? calculatePositionPnl(a, false) - calculatePositionPnl(b, false)
          : calculatePositionPnl(b, false) - calculatePositionPnl(a, false);
      case "24hrDelta":
        return sortAscending
          ? findSymbolPrice(a.symbol, positionTickerPnLLists) -
              findSymbolPrice(b.symbol, positionTickerPnLLists)
          : findSymbolPrice(b.symbol, positionTickerPnLLists) -
              findSymbolPrice(a.symbol, positionTickerPnLLists);
      default:
        return 0;
    }
  });

  function calculatePositionPnl(position, forDisplay) {
    let positionPnl = "";
    if (position.avgCost === "") {
      return positionPnl;
    }
    let initialInvestment = position.avgCost * position.quantity;
    positionPnl = (
      nomicsTickers[position.symbol].usd * position.quantity -
      initialInvestment
    ).toFixed(2);
    if (forDisplay) {
      positionPnl = "$" + positionPnl;
    }
    return positionPnl;
  }

  // function findSymbolPrice(symbol) {
  //   for (let i = 0; i < positionTickerPnLLists.length; i++) {
  //     const obj = positionTickerPnLLists[i];
  //     if (obj.id === symbol) {
  //       return obj.price_change_percentage_24h;
  //     }
  //   }
  //   return null; // Return null if symbol is not found
  // }

  function calculateTotalPositionPnL() {
    let totalPositionPnl = 0;
    sortedPositions.map((position) => {
      totalPositionPnl += parseFloat(
        calculatePositionPnlPercentage(position, false)
      );
    });
    return totalPositionPnl;
  }

  function calculateTotal24HrPnL() {
    let total24HrPnl = 0;
    sortedPositions.map((position) => {
      total24HrPnl += parseFloat(calculate24HrPositionPnl(position));
    });
    return total24HrPnl;
  }

  function calculatePositionPnlPercentage(position, forDisplay) {
    let positionPnl = "Need Avg Price";
    if (position.avgCost === "") {
      return positionPnl;
    }
    let initialInvestment = position.avgCost * position.quantity;
    positionPnl = (
      (((nomicsTickers[position.symbol].usd - position.avgCost) *
        position.quantity) /
        initialInvestment) *
      100
    ).toFixed(2);
    if (forDisplay) {
      positionPnl = positionPnl + "%";
    }

    // console.log(`${position.symbol}: ${(positionPnl % 10).toFixed(2)}`);
    return positionPnl;
  }

  function calculate24HrPositionPnl(selectedPosition) {
    let delta =
      findSymbolPrice(selectedPosition.symbol, positionTickerPnLLists) / 100;
    if (delta !== null) {
      let value = (
        nomicsTickers[selectedPosition.symbol].usd * selectedPosition.quantity
      ).toFixed(2);

      return (delta * value).toFixed(2);
    }
    return null;
  }

  function showTickerChart(symbol) {
    getTickerPriceChart(symbol);
    setSelectedSymbol(symbol);
    setShowModal(true);
  }

  useEffect(() => {}, [privacyFilter]);

  return (
    <div className="pb-4 sm:pb-0 text-white ">
      <div className="flex flex-col sm:gap-4 text-sm">
        <div className="flex flex-col items-center">
          {showModal && cachedTickerPriceChart}
          <table className="text-sm sm:text-base sm:w-full min-w-full overflow-x-auto">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-900 via-indigo-3500 to-indigo-900 text-white">
                <th
                  className="px-2 py-1 sm:px-4 sm:py-2  hover:animate-pulse hover:cursor-pointer"
                  onClick={() => handleHeaderClick("symbol")}
                >
                  Symbol{" "}
                  {sortBy === "symbol" && (sortAscending ? "(A-Z)" : "(Z-A)")}
                </th>
                <th
                  className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer"
                  onClick={() => handleHeaderClick("currentPrice")}
                >
                  Current Price{" "}
                  {sortBy === "currentPrice" && (sortAscending ? "↑" : "↓")}
                </th>
                <th
                  className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer"
                  onClick={() => handleHeaderClick("avgPrice")}
                >
                  Avg Price{" "}
                  {sortBy === "avgPrice" && (sortAscending ? "↑" : "↓")}
                </th>
                <th
                  className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer"
                  onClick={() => handleHeaderClick("24hrDelta")}
                >
                  Position 24hr Δ{" "}
                  {sortBy === "24hrDelta" && (sortAscending ? "↑" : "↓")}
                </th>
                <th
                  className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer"
                  onClick={() => handleHeaderClick("pnl")}
                >
                  Position PnL {sortBy === "pnl" && (sortAscending ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((position, index) => {
                const assetInfo = positionTickerPnLLists.find(
                  (asset) => asset.id === position.symbol
                );
                const image = assetInfo?.image || "";
                return (
                  <>
                    <tr
                      className={`hover:cursor-pointer hover:animate-pulse ${
                        index === sortedPositions.length - 1
                          ? ""
                          : "border-b border-gray-300"
                      }`}
                      key={position.symbol}
                      onClick={() => showTickerChart(position.symbol)}
                    >
                      <td className="py-1 flex items-center justify-center pt-3 sm:pt-5">
                        <img
                          src={image}
                          alt={position.symbol}
                          className="w-6 h-6 mr-2"
                        />
                      </td>
                      <td className="py-1 sm:px-4 sm:py-2">
                        $
                        {addCommaToNumberString(
                          nomicsTickers[position.symbol].usd
                        )}
                      </td>
                      <td className="py-1 sm:px-4 sm:py-2">
                        $
                        {addCommaToNumberString(
                          Math.floor(position.avgCost) <= 1000
                            ? position.avgCost
                            : parseInt(position.avgCost)
                        )}
                      </td>
                      <td className="py-1 sm:px-4 sm:py-2">
                        <div className={``}>
                          $
                          {addCommaToNumberString(
                            calculate24HrPositionPnl(position)
                          )}
                        </div>
                        <div
                          className={`${
                            findSymbolPrice(
                              position.symbol,
                              positionTickerPnLLists
                            ) < 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          (
                          {addCommaToNumberString(
                            findSymbolPrice(
                              position.symbol,
                              positionTickerPnLLists
                            ).toFixed(2)
                          )}
                          %)
                        </div>
                      </td>

                      <td
                        className={`py-1 sm:px-4 sm:py-2 ${
                          calculatePositionPnlPercentage(
                            position,
                            false
                          ).includes("-")
                            ? "text-red-500"
                            : calculatePositionPnl(position, true) ===
                              "Need Avg Price"
                            ? "text-gray-600"
                            : "text-green-500"
                        }`}
                      >
                        <div className="text-white">
                          {privacyFilter.privacyFilter
                            ? maskNumber(calculatePositionPnl(position))
                            : addCommaToNumberString(
                                calculatePositionPnl(position, true)
                              )}
                        </div>
                        (
                        {addCommaToNumberString(
                          countDigits(
                            calculatePositionPnlPercentage(position, false)
                          ) <= 3
                            ? calculatePositionPnlPercentage(position, true)
                            : parseInt(
                                calculatePositionPnlPercentage(position, false)
                              ) + "%"
                        )}
                        )
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300">
                <td className="py-1 sm:px-4 sm:py-2 font-bold">Totals:</td>
                <td className="py-1 sm:px-4 sm:py-2"></td>
                <td className="py-1 sm:px-4 sm:py-2"></td>
                <td
                  className={`py-1 sm:px-4 sm:py-2 font-bold ${
                    calculateTotal24HrPnL() < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {calculateTotal24HrPnL()}
                </td>
                <td
                  className={`py-1 sm:px-4 sm:py-2 font-bold ${
                    calculateTotalPositionPnL() < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {calculateTotalPositionPnL()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
