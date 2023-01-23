import React from "react";
import { useEffect, useContext, useState } from "react";
import { useFirestore } from "../contexts/FirestoreContext";
import { PricePoint } from "../Classes/PricePoint";

const CryptoContext = React.createContext();

export function useCryptoOracle() {
  return useContext(CryptoContext);
}

export function CryptoProvider({ children }) {
  const {
    activeUser,
    getPortfolio,
    addPosition,
    removePositionFromFirebase,
    recordPortfolioValue,
    cleanupDuplicatesInHistorical,
    getPortfolioTickerList,
    getCurrentDate,
    recordPortfolioPositionValues,
  } = useFirestore();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nomicsTickers, setNomicsTickers] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [refreshAvailable, setRefreshAvailable] = useState(true);
  const [portfolioPositions, setPortfolioPositions] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState();
  const [portfolioValueHistory, setPortfolioValueHistory] = useState([]);
  const [filteredPortfolioValueHistory, setFilteredPortfolioValueHistory] =
    useState([]);
  const [currentChartDateRange, setCurrentChartDateRange] = useState("1D");
  const [error, setError] = useState("");

  useEffect(() => {
    refreshOraclePrices();
    // getPortfolioData();
  }, []);

  async function refreshOraclePrices() {
    let tickerList = await getPortfolioTickerList();
    tickerList = Object.keys(tickerList);
    setNomicsTickers([]);
    setLoading(true);
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tickerList.join(
        ","
      )}&vs_currencies=usd`
    )
      .then((response) => response.json())
      .then((tickers) => {
        setNomicsTickers(tickers);
        setLoading(false);
      });
  }

  function searchCoinGeckoAPI(ticker) {
    fetch(`https://api.coingecko.com/api/v3/search?query=${ticker}`)
      .then((response) => response.json())
      .then((searchResponse) => {
        setSearchResults(searchResponse.coins);
        return searchResponse.coins;
      });
  }

  async function getPortfolioData() {
    const portfolio = await getPortfolio(activeUser.portfolioID);
    setCurrentPortfolio(portfolio);
    cleanupDuplicatesInHistorical(activeUser.portfolioID);
    calculatePortfolioValue(portfolio);
    dateByRange(portfolio.portfolioValueHistory, currentChartDateRange);

    setPortfolioValueHistory(portfolio.portfolioValueHistory);
    //positionValue -> {id: "", value: ""}
    const portPositions = portfolio.positions;
    let priceValues = [];
    portPositions.forEach((position) => {
      priceValues.push({
        id: position.symbol + position.quantity + position.type,
        value:
          parseFloat(position.quantity) *
          parseFloat(nomicsTickers[position.symbol].usd),
      });
    });

    // recordPortfolioPositionValues(portPositions, priceValues, activeUser.portfolioID)
  }

  function dateByRange(data, dateRange) {
    let filteredData = [];
    let currentDate = new Date();

    switch (dateRange) {
      case "1D":
        let oneDayAgo = new Date(currentDate);
        oneDayAgo.setDate(currentDate.getDate() - 1);
        filteredData = data.filter(function (item) {
          return (
            new Date(item.date) >= oneDayAgo &&
            new Date(item.date) <= currentDate
          );
        });
        break;
      case "1W":
        let oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(currentDate.getDate() - 7);
        filteredData = data.filter(function (item) {
          return (
            new Date(item.date) >= oneWeekAgo &&
            new Date(item.date) <= currentDate
          );
        });
        break;
      case "1M":
        let oneMonthAgo = new Date(currentDate);
        oneMonthAgo.setMonth(currentDate.getMonth() - 1);
        filteredData = data.filter(function (item) {
          return (
            new Date(item.date) >= oneMonthAgo &&
            new Date(item.date) <= currentDate
          );
        });
        break;
      case "1Y":
        let oneYearAgo = new Date(currentDate);
        oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
        filteredData = data.filter(function (item) {
          return (
            new Date(item.date) >= oneYearAgo &&
            new Date(item.date) <= currentDate
          );
        });
        break;
      default:
        console.log("Invalid date range specified.");
    }

    // console.log(filteredData);
    setFilteredPortfolioValueHistory(filteredData);
  }

  function calculatePortfolioValue(portfolio) {
    let totalSum = 0;
    let positionsList = [];
    const positions = portfolio.positions;
    if (positions.length > 0) {
      positions.forEach((position) => {
        positionsList.push(position);
        if (nomicsTickers[position.symbol]) {
          totalSum +=
            parseFloat(nomicsTickers[position.symbol].usd) * position.quantity;
        }
      });
    }
    setPortfolioValue(totalSum.toFixed(2));
    // Sort list descending order by position value
    positionsList.sort((a, b) =>
      parseFloat(nomicsTickers[a.symbol].usd) * a.quantity <
      parseFloat(nomicsTickers[b.symbol].usd) * b.quantity
        ? 1
        : parseFloat(nomicsTickers[b.symbol].usd) * b.quantity <
          parseFloat(nomicsTickers[a.symbol].usd) * a.quantity
        ? -1
        : 0
    );

    setPortfolioPositions(positionsList);
    if (totalSum !== 0) {
      recordPortfolioValue(
        PricePoint(getCurrentDate(), totalSum),
        activeUser.portfolioID
      ).catch((err) => setError(err.message));
    }
  }

  function calculatePositionPrice(position) {
    if (nomicsTickers[position.symbol]) {
      return parseFloat(nomicsTickers[position.symbol].usd) * position.quantity;
    }
  }

  const value = {
    nomicsTickers,
    refreshOraclePrices,
    searchCoinGeckoAPI,
    searchResults,
    refreshAvailable,
    setRefreshAvailable,
    portfolioValue,
    setPortfolioValue,
    setCurrentPortfolio,
    portfolioPositions,
    currentPortfolio,
    cleanupDuplicatesInHistorical,
    calculatePortfolioValue,
    setPortfolioValueHistory,
    portfolioValueHistory,
    getPortfolioData,
    calculatePositionPrice,
    setFilteredPortfolioValueHistory,
    filteredPortfolioValueHistory,
    dateByRange,
    setCurrentChartDateRange,
    currentChartDateRange,
  };

  return (
    <CryptoContext.Provider value={value}>
      {!loading && children}
    </CryptoContext.Provider>
  );
}
