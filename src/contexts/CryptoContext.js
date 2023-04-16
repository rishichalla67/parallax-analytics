import React from "react";
import { useEffect, useContext, useState, useCallback } from "react";
import { useFirestore } from "../contexts/FirestoreContext";
import { PricePoint } from "../Classes/PricePoint";
import moment from "moment";

const CryptoContext = React.createContext();

export function useCryptoOracle() {
  return useContext(CryptoContext);
}

const cache = {};

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
  const [currentChartDateRange, setCurrentChartDateRange] = useState("24HR");
  const [error, setError] = useState("");
  const [positionTickerPnLLists, setPositionTickerPnLLists] = useState([]);
  const [symbolChartData, setSymbolChartData] = useState([]);

  useEffect(() => {
    refreshOraclePrices();
    // getPortfolioData();
  }, []);

  const refreshOraclePrices = useCallback(async () => {
    let tickerList = await getPortfolioTickerList();
    tickerList = Object.keys(tickerList);
    setNomicsTickers([]);
    setLoading(true);
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tickerList.join(
        ","
      )}&vs_currencies=usd&include_last_updated_at=true`
    )
      .then((response) => response.json())
      .then((tickers) => {
        setNomicsTickers(tickers);
        setLoading(false);
      });
  }, [setNomicsTickers, setLoading]);

  function getAllTickerDailyPnLs(positions) {
    const positionSymbolList = [];
    positions.map((position) => {
      positionSymbolList.push(position.symbol);
    });

    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${positionSymbolList.join(
        ","
      )}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y`
    )
      .then((response) => response.json())
      .then((searchResponse) => {
        const positionTickerPnLLists = searchResponse.map(
          (searchResponseObject) => {
            return searchResponseObject;
          }
        );
        console.log(positionTickerPnLLists);
        setPositionTickerPnLLists(positionTickerPnLLists);
      });
  }

  const cache = new Map();
  const CACHE_MAX_SIZE = 100; // Maximum number of cached items
  const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

  function getTickerPriceChart(symbol) {
    const headers = new Headers();
    headers.append("Access-Control-Allow-Origin", "*");

    // Check if the symbol data is in the cache and has not expired
    const cachedItem = cache.get(symbol);
    if (cachedItem && Date.now() < cachedItem.expirationTime) {
      // Return the cached data
      return Promise.resolve(cachedItem.data);
    }

    // If the data is not in the cache or has expired, fetch it from the API
    return fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=max`,
      {
        method: "GET",
        headers: headers,
        mode: "cors",
        cache: "default",
      }
    )
      .then((response) => response.json())
      .then((searchResponse) => {
        // Convert the response data to the required format
        const chartData = convertArray(searchResponse.prices);

        // Store the data in the cache with an expiration time
        const expirationTime = Date.now() + CACHE_EXPIRATION_TIME;
        cache.set(symbol, {
          data: chartData,
          expirationTime: expirationTime,
        });

        // Prune the cache if it has exceeded the maximum size
        if (cache.size > CACHE_MAX_SIZE) {
          const oldestSymbol = cache.keys().next().value;
          cache.delete(oldestSymbol);
        }

        // Return the data
        return chartData;
      });
  }

  async function searchCoinGeckoAPI(ticker) {
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
    getAllTickerDailyPnLs(portfolio.positions);
    setFilteredPortfolioValueHistory(
      filterDataByDateRange(
        portfolio.portfolioValueHistory,
        currentChartDateRange,
        true
      )
    );

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

  function filterDataByDateRange(data, dateRange, assignVariable) {
    let filteredData = [];
    const currentDate = new Date();
    const oneHour = 60 * 60 * 1000;
    const sixHours = 6 * oneHour; // milliseconds in six hours
    const twelveHours = 12 * oneHour; // milliseconds in twelve hours
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
    const oneWeek = 7 * oneDay; // milliseconds in one week
    const oneMonth = 30 * oneDay; // milliseconds in one month
    const oneYear = 365 * oneDay; // milliseconds in one year

    data.forEach((item) => {
      const itemDate = moment(item.date, "YYYY-MM-DD HH:mm:ss");
      let timeDiff = currentDate - itemDate.toDate();

      switch (dateRange) {
        case "1HR":
          if (timeDiff <= oneHour) {
            filteredData.push(item);
          }
          break;
        case "6HR":
          if (timeDiff <= sixHours) {
            filteredData.push(item);
          }
          break;
        case "12HR":
          if (timeDiff <= twelveHours) {
            filteredData.push(item);
          }
          break;
        case "24HR":
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

    // Only set filteredPortfolioValueHistory if setVariable is true
    if (assignVariable) {
      setFilteredPortfolioValueHistory(filteredData);
    }
    return filteredData;
  }

  function convertArray(arr) {
    return arr.map(([date, value]) => ({ date, value }));
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
    filterDataByDateRange,
    setCurrentChartDateRange,
    currentChartDateRange,
    positionTickerPnLLists,
    getAllTickerDailyPnLs,
    getTickerPriceChart,
    symbolChartData,
    positionTickerPnLLists,
  };

  return (
    <CryptoContext.Provider value={value}>
      {!loading && children}
    </CryptoContext.Provider>
  );
}
