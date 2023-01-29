import React, { useState, useEffect } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
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

export function Analyics({ portfolioValueHistory }) {
  const {} = useCryptoOracle();

  function filterDataByDateRange(data, dateRange) {
    let filteredData = [];
    const currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
    const oneWeek = 7 * oneDay; // milliseconds in one week
    const oneMonth = 30 * oneDay; // milliseconds in one month
    const oneYear = 365 * oneDay; // milliseconds in one year

    data.forEach((item) => {
      const itemDate = moment(item.date, "YYYY-MM-DD HH:mm:ss");
      let timeDiff = currentDate - itemDate.toDate();

      switch (dateRange) {
        case "1D":
          if (timeDiff <= oneDay) {
            filteredData.push(item);
          }
          break;
        case "1W":
          if (timeDiff <= oneWeek) {
            filteredData.push(item);
          }
          break;
        case "1M":
          if (timeDiff <= oneMonth) {
            filteredData.push(item);
          }
          break;
        case "1Y":
          if (timeDiff <= oneYear) {
            filteredData.push(item);
          }
          break;
        default:
          // Return original data if invalid date range is provided
          filteredData = data;
      }
    });

    return filteredData;
  }

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
      </div>
    </div>
  );
}
