import React from "react";
import { useEffect, useContext, useState } from "react";
import { useFirestore } from "../contexts/FirestoreContext";
import { PricePoint } from "../Classes/PricePoint";
import moment from "moment";

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
  const [currentChartDateRange, setCurrentChartDateRange] = useState("24HR");
  const [error, setError] = useState("");
  const [positionTickerPnLLists, setPositionTickerPnLLists] = useState([])

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

  function getTickerDailyPnL(ticker) {
    fetch(`https://api.coingecko.com/api/v3/coins/${ticker.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`)
      .then((response) => response.json())
      .then((searchResponse) => {
        return searchResponse.market_data.price_change_percentage_24h;
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
    setFilteredPortfolioValueHistory(
    filterDataByDateRange(
      portfolio.portfolioValueHistory,
      currentChartDateRange, true
    ));

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
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
    const oneWeek = 7 * oneDay; // milliseconds in one week
    const oneMonth = 30 * oneDay; // milliseconds in one month
    const oneYear = 365 * oneDay; // milliseconds in one year

    data.forEach((item) => {
      const itemDate = moment(item.date, "YYYY-MM-DD HH:mm:ss");
      let timeDiff = currentDate - itemDate.toDate();

      switch (dateRange) {
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
    if(assignVariable){
      setFilteredPortfolioValueHistory(filteredData)}
    return filteredData;
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
    getTickerDailyPnL,
    positionTickerPnLLists
  };

  return (
    <CryptoContext.Provider value={value}>
      {!loading && children}
    </CryptoContext.Provider>
  );
}
