import React, { useState, useEffect } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";
import { addCommaToNumberString, maskNumber } from "./CryptoPortfolio";

export function calculatePnl(data) {
  if (data[0].value) {
    return (
      ((data[data.length - 1].value - data[0].value) /
        data[data.length - 1].value) *
      100
    ).toFixed(2);
  }
  //   console.log(data);
}

export function formatSymbol(str) {
  let symbol = "";
  symbol = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return symbol;
}

export function Analyics(privacyFilter) {
  const {
    nomicsTickers,
    portfolioValueHistory,
    filterDataByDateRange,
    portfolioPositions,
  } = useCryptoOracle();
  const { tickerList } = useFirestore();

  //   console.log(filterDataByDateRange(portfolioValueHistory, "1D"));

  const [pnl1D, setPnl1D] = useState("");
  const [pnl1W, setPnl1W] = useState("");
  const [pnl1M, setPnl1M] = useState("");
  const [pnl1Y, setPnl1Y] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortAscending, setSortAscending] = useState(true);

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
          ? formatSymbol(tickerList[a.symbol]).localeCompare(formatSymbol(tickerList[b.symbol]))
          : formatSymbol(tickerList[b.symbol]).localeCompare(formatSymbol(tickerList[a.symbol]));
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
      // case "pnl":
      //   return sortAscending
      //     ? calculatePositionPnl(a) - calculatePositionPnl(b)
      //     : calculatePositionPnl(b) - calculatePositionPnl(a);
      default:
        return 0;
    }
  });

  function calculatePositionPnl(position) {
    let positionPnl = "";
    if (position.avgCost === "") {
      return positionPnl;
    }
    let initialInvestment = position.avgCost * position.quantity;
    positionPnl = (
      nomicsTickers[position.symbol].usd * position.quantity -
      initialInvestment
    ).toFixed(2);
    positionPnl = "$" + positionPnl;
    return positionPnl;
  }

  function calculatePositionPnlPercentage(position) {
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
    positionPnl = positionPnl + "%";

    return positionPnl;
  }

  useEffect(() => {
    let dayFilterRange = filterDataByDateRange(
      portfolioValueHistory,
      "24HR",
      false
    );
    let weekFilterRange = filterDataByDateRange(
      portfolioValueHistory,
      "1W",
      false
    );
    let monthFilterRange = filterDataByDateRange(
      portfolioValueHistory,
      "1M",
      false
    );
    let yearFilterRange = filterDataByDateRange(
      portfolioValueHistory,
      "1Y",
      false
    );

    setPnl1D(calculatePnl(dayFilterRange));
    setPnl1W(calculatePnl(weekFilterRange));
    setPnl1M(calculatePnl(monthFilterRange));
    setPnl1Y(calculatePnl(yearFilterRange));
    console.log(privacyFilter.privacyFilter);
  }, [privacyFilter]);

  return (
    <div className="pb-4 sm:pb-0 text-white ">
      <div className="flex flex-col sm:gap-4 text-sm">
      <div className="flex flex-col items-center">
        <table className="text-sm sm:text-base sm:w-full min-w-full overflow-x-auto">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-900 via-indigo-3500 to-indigo-900 text-white">
              <th
                className="px-2 py-1 sm:px-4 sm:py-2  hover:animate-pulse hover:cursor-pointer"
                onClick={() => handleHeaderClick("symbol")}
              >
                Symbol {sortBy === "symbol" && (sortAscending ? "(A-Z)" : "(Z-A)")}
              </th>
              <th
                className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer"
                onClick={() => handleHeaderClick("currentPrice")}
              >
                Current Price {sortBy === "currentPrice" && (sortAscending ? "↑" : "↓")}
              </th>
              <th
                className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer"
                onClick={() => handleHeaderClick("avgPrice")}
              >
                Avg Price {sortBy === "avgPrice" && (sortAscending ? "↑" : "↓")}
              </th>
              <th className="px-2 py-1 sm:px-4 sm:py-2 hover:animate-pulse hover:cursor-pointer" onClick={() => handleHeaderClick("quantity")}>Quantity {sortBy === "quantity" && (sortAscending ? "↑" : "↓")}</th>
              <th className="px-2 py-1 sm:px-4 sm:py-2">PnL</th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map((position, index) => (
              <tr
                className={`${index === sortedPositions.length - 1 ? "" : "border-b border-gray-300"}`}
                key={position.symbol}
              >
                <td className="py-1">
                  {formatSymbol(tickerList[position.symbol])}
                </td>
                <td className="py-1 sm:px-4 sm:py-2">${nomicsTickers[position.symbol].usd}</td>
                <td className="py-1 sm:px-4 sm:py-2">${position.avgCost}</td>
                <td className="py-1 sm:px-4 sm:py-2">
                  {position.symbol === "bitcoin"
                    ? privacyFilter.privacyFilter
                      ? maskNumber(position.quantity.toFixed(4))
                      : addCommaToNumberString(position.quantity.toFixed(4))
                    : privacyFilter.privacyFilter
                    ? maskNumber(position.quantity.toFixed(2))
                    : addCommaToNumberString(position.quantity.toFixed(2))}
                </td>
                <td
                  className={`py-1 sm:px-4 sm:py-2 ${
                    calculatePositionPnlPercentage(position).includes("-")
                      ? "text-red-500"
                      : calculatePositionPnl(position) === "Need Avg Price"
                      ? "text-gray-600"
                      : "text-green-500"
                  }`}
                >
                  <div>{privacyFilter.privacyFilter
                    ? maskNumber(calculatePositionPnl(position))
                    : addCommaToNumberString(calculatePositionPnl(position))}</div>
                    
                  ({addCommaToNumberString(calculatePositionPnlPercentage(position))})
                  
                  
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
    </div>
  );
}
