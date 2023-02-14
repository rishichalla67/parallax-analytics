import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { addCommaToNumberString } from "./CryptoPortfolio";
import { calculatePnl } from "./Analytics";

const moment = require("moment");

export function findMaxValue(data) {
  let highest = 0;
  data.map((item) => {
    if (parseInt(item.value * 1.0) > highest) {
      highest = parseInt(item.value * 1.0);
    }
  });
  return highest;
}

export function findMinValue(data) {
  let lowest = data[0].value;
  data.map((item) => {
    if (parseInt(item.value * 1.0) < lowest) {
      lowest = parseInt(item.value * 1.0);
    }
  });
  return lowest;
}

let dateIndex = "24HR";

export default function Chart({ privacyFilter }) {
  // const [dateIndex, setDateIndex] = useState("24HR");
  function setDateIndex(newDateIndex) {
    dateIndex = newDateIndex;
  }

  const {
    nomicsTickers,
    refreshOraclePrices,
    searchCoinGeckoAPI,
    searchResults,
    setRefreshAvailable,
    refreshAvailable,
    portfolioValue,
    setPortfolioValue,
    getPortfolioData,
    portfolioValueHistory,
    portfolioPositions,
    filteredPortfolioValueHistory,
    setCurrentChartDateRange,
    currentChartDateRange,
    filterDataByDateRange,
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

  function formatDate(date) {
    let formattedDate;
    let momentDate = moment(date, "YYYY-MM-DD HH:mm:ss"); //parse the date in this format
    if (!momentDate.isValid()) {
      return "Invalid Date";
    }

    switch (currentChartDateRange) {
      case "24HR":
        let today = moment().startOf("day");
        if (momentDate.isSame(today, "day")) {
          formattedDate = momentDate.format("h:mm A");
        } else if (momentDate.isSame(today.subtract(1, "days"), "day")) {
          formattedDate = "Yesterday " + momentDate.format("h:mm A");
        }
        break;
      case "1HR":
        let oneHourAgo = moment().subtract(1, "hours");
        if (momentDate.isAfter(oneHourAgo)) {
          formattedDate = momentDate.format("h:mm A");
        } else {
          formattedDate = momentDate.format("MMMM Do, h:mm A");
        }
        break;
      case "12HR":
        let twelveHoursAgo = moment().subtract(12, "hours");
        if (momentDate.isAfter(twelveHoursAgo)) {
          formattedDate = momentDate.format("h:mm A");
        } else {
          formattedDate = momentDate.format("MMMM Do, h:mm A");
        }
        break;
      case "1W":
        formattedDate = momentDate.format("ddd h:mm A");
        break;
      case "1M":
        formattedDate = momentDate.format("MMMM Do");
        break;
      case "1Y":
        formattedDate = momentDate.format("MMMM Do, YYYY");
        break;
      default:
        formattedDate = momentDate.format();
    }
    return formattedDate;
  }

  return (
    <>
      <div className="justify-end flex">
        <div className="text-center">
          <button
            onClick={() => {
              setCurrentChartDateRange("1HR");
              setDateIndex("1HR");
            }}
            className={`inline-block p-2 sm:p-4 ${
              dateIndex === "1HR"
                ? "text-white bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
                : "text-sky-500 hover:bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
            }`}
          >
            1HR
          </button>
          <button
            onClick={() => {
              setCurrentChartDateRange("12HR");
              setDateIndex("12HR");
            }}
            className={`inline-block sm:p-4 ${
              dateIndex === "12HR"
                ? "text-white bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
                : "text-sky-500 hover:bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
            }`}
          >
            12HR
          </button>
          <button
            onClick={() => {
              setCurrentChartDateRange("24HR");
              setDateIndex("24HR");
            }}
            className={`inline-block sm:p-4 ${
              dateIndex === "24HR"
                ? "text-white bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
                : "text-sky-500 hover:bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
            }`}
          >
            24HR
          </button>
          <button
            onClick={() => {
              setCurrentChartDateRange("1W");
              setDateIndex("1W");
            }}
            className={`inline-block sm:p-4 ${
              dateIndex === "1W"
                ? "text-white bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
                : "text-sky-500 hover:bg-purple-900 font-bold m-2 p-1 sm:p-2rounded"
            }`}
          >
            1W
          </button>
          <button
            onClick={() => {
              setCurrentChartDateRange("1M");
              setDateIndex("1M");
            }}
            className={`inline-block sm:p-4 ${
              dateIndex === "1M"
                ? "text-white bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
                : "text-sky-500 hover:bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
            }`}
          >
            1M
          </button>
          <button
            onClick={() => {
              setCurrentChartDateRange("sm:1Y");
              setDateIndex("1Y");
            }}
            className={`inline-block sm:p-4 ${
              dateIndex === "1Y"
                ? "text-white bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
                : "text-sky-500 hover:bg-purple-900 font-bold m-2 p-1 sm:p-2 rounded"
            }`}
          >
            1Y
          </button>
        </div>
      </div>
      {filteredPortfolioValueHistory.length > 0 && (
        <>
          <div className="flex justify-start ">
            <ResponsiveContainer width="100%" height={300 || 250}>
              <LineChart data={filteredPortfolioValueHistory}>
                <XAxis hide={true} dataKey="date" />
                <YAxis
                  hide={privacyFilter}
                  axisLine={false}
                  dataKey="value"
                  tickLine={false}
                  tickFormatter={(value) => `$${addCommaToNumberString(value)}`}
                  // tick={{ fontSize: "0.rem" }}
                  domain={[
                    Math.round(
                      parseInt(
                        (findMinValue(filteredPortfolioValueHistory) * 0.99) /
                          10
                      ) * 10
                    ), // lower bound
                    Math.round(
                      parseInt(
                        (findMaxValue(filteredPortfolioValueHistory) * 1.01) /
                          10
                      ) * 10
                    ), // upper bound
                  ]}
                />
                <Tooltip
                  style={{ color: "red" }}
                  content={({ payload }) => {
                    return (
                      <div className="bg-black p-2">
                        {payload &&
                          payload.map((data, i) => (
                            <div key={i}>
                              {/* {console.log(data)} */}
                              <p>
                                {"date: "}
                                {formatDate(data.payload.date)}
                              </p>
                              <p>
                                {data.name} :{" $"}
                                {addCommaToNumberString(data.value)}
                              </p>
                            </div>
                          ))}
                      </div>
                    );
                  }}
                  contentStyle={{ backgroundColor: "#000000" }}
                  itemStyle={{ color: "#FFFFFF" }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={`${
                    calculatePnl(filteredPortfolioValueHistory) > 0
                      ? "#00FF7F"
                      : "#B90E0A"
                  }`}
                  dot={false}
                  activeDot={true}
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
