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
    addTicker,
    tickerList,
    createPortfolio,
    updatePosition,
    fetchAllUsers,
    getPortfolioTickerList,
  } = useFirestore();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nomicsTickers, setNomicsTickers] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [refreshAvailable, setRefreshAvailable] = useState(true);
  const [portfolioPositions, setPortfolioPositions] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState();
  const [portfolioValueHistory, setPortfolioValueHistory] = useState([]);
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
    setPortfolioValueHistory(portfolio.portfolioValueHistory);
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

  function getCurrentDate() {
    var tempDate = new Date();
    var date =
      tempDate.getFullYear() +
      "-" +
      (tempDate.getMonth() + 1) +
      "-" +
      tempDate.getDate() +
      " " +
      tempDate.getHours() +
      ":" +
      tempDate.getMinutes() +
      ":" +
      tempDate.getSeconds();
    return date;
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
  };

  return (
    <CryptoContext.Provider value={value}>
      {!loading && children}
    </CryptoContext.Provider>
  );
}
