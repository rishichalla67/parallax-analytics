import React, { useState, useEffect } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";

import moment from "moment";

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

export function Analyics() {
  const {
    portfolioValueHistory,
    filterDataByDateRange,
    portfolioPositions,
  } = useCryptoOracle();
  const {
    activeUser,
    addPosition,
    removePositionFromFirebase,
    addTicker,
    tickerList,
    createPortfolio,
    updatePosition,
    fetchAllUsers,
  } = useFirestore();

  //   console.log(filterDataByDateRange(portfolioValueHistory, "1D"));

  const [pnl1D, setPnl1D] = useState("");
  const [pnl1W, setPnl1W] = useState("");
  const [pnl1M, setPnl1M] = useState("");
  const [pnl1Y, setPnl1Y] = useState("");

  useEffect(() => {
    let dayFilterRange = filterDataByDateRange(portfolioValueHistory, "24HR");
    let weekFilterRange = filterDataByDateRange(portfolioValueHistory, "1W");
    let monthFilterRange = filterDataByDateRange(portfolioValueHistory, "1M");
    let yearFilterRange = filterDataByDateRange(portfolioValueHistory, "1Y");

    setPnl1D(calculatePnl(dayFilterRange));
    setPnl1W(calculatePnl(weekFilterRange));
    setPnl1M(calculatePnl(monthFilterRange));
    setPnl1Y(calculatePnl(yearFilterRange));
  }, []);

  return (
    <div className="bg-gray-800 text-white p-2 md:px-16 md:py-16">
      <div className="flex flex-col sm:gap-4 text-sm">
        <div className="text-lg sm:text-4xl font-medium leading-6">PnL</div>
        <div className="flex flex-wrap sm:text-xl md:text-3xl sm:gap-4">
          <div className={`text-center sm:text-left p-1 `}>
            24HR:
            <a
              className={`pl-2 ${
                pnl1D >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1D}%
            </a>
          </div>
          <div className={`text-center sm:text-left p-1 `}>
            1W:
            <a
              className={`pl-2 ${
                pnl1W >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1W}%
            </a>
          </div>
          <div className={`text-center sm:text-left p-1 `}>
            1M:
            <a
              className={`pl-2 ${
                pnl1M >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1M}%
            </a>
          </div>
          <div className={`text-center sm:text-left p-1 `}>
            1Y:
            <a
              className={`pl-2 ${
                pnl1Y >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1Y}%
            </a>
          </div>
        </div>
        {/* Position Table */}
        <div className="flex flex-wrap sm:text-xl md:text-3xl sm:gap-4">
          <div className={`text-center sm:text-left p-1 `}>
            24HR:
            <a
              className={`pl-2 ${
                pnl1D >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1D}%
            </a>
          </div>
          <div className={`text-center sm:text-left p-1 `}>
            1W:
            <a
              className={`pl-2 ${
                pnl1W >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1W}%
            </a>
          </div>
          <div className={`text-center sm:text-left p-1 `}>
            1M:
            <a
              className={`pl-2 ${
                pnl1M >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1M}%
            </a>
          </div>
          <div className={`text-center sm:text-left p-1 `}>
            1Y:
            <a
              className={`pl-2 ${
                pnl1Y >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pnl1Y}%
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
