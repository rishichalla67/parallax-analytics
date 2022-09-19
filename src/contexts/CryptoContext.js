import React from "react";
import { useEffect, useContext, useState } from "react";
import { useFirestore } from "../contexts/FirestoreContext";

const CryptoContext = React.createContext();

export function useCryptoOracle() {
  return useContext(CryptoContext);
}

export function CryptoProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [nomicsTickers, setNomicsTickers] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const { getPortfolioTickerList } = useFirestore();

  useEffect(() => {
    refreshOraclePrices();
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

  const value = {
    nomicsTickers,
    refreshOraclePrices,
    searchCoinGeckoAPI,
    searchResults,
  };

  return (
    <CryptoContext.Provider value={value}>
      {!loading && children}
    </CryptoContext.Provider>
  );
}
