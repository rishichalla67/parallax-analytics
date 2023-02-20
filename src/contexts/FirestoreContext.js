import React from "react";
import { useEffect, useContext, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { PricePoint } from "../Classes/PricePoint";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  FieldValue
} from "firebase/firestore";

const FirestoreContext = React.createContext();

export function useFirestore() {
  return useContext(FirestoreContext);
}

export function FirestoreProvider({ children }) {

  const { currentUser } = useAuth();
  const [activeUser, setActiveUser] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPortfolioIds, setAllPortfolioIds] = useState([]);
  const [tickerList, setTickerList] = useState([]);
  const [tickersNotInTradingView, setTickersNotInTradingView] = useState([]);
  const [tickersInTradingView, setTickersInTradingView] = useState([]);

  const dbPortfolioCollection = db.collection("portfolios");
  const tickerListDocRef = doc(db, "portfolios", "tickerList");
  const dbUsersCollection = db.collection("users");

  useEffect(() => {
    if (allUsers.length === 0) {
      fetchAllUsers();
    }
    if (allPortfolioIds.length === 0) {
      getPortfolioIds();
      getPortfolioTickerList();
      // getPortfolioTickerTradingViewLists();
    }

    setLoading(false);
  }, []);

  // Helper Functions

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

  // CRYPTO PORTFOLIO FUNCTIONS

  function createPortfolio(portfolioId, userId) {
    dbPortfolioCollection.doc(portfolioId).set({
      portfolioValueHistory: [],
      positions: [],
    });

    dbUsersCollection
      .doc(userId)
      .update({
        portfolioID: portfolioId,
      })
      .then(() => {
        refreshUser(userId);
      });
  }

  async function getPortfolioIds() {
    const portfolios = await dbPortfolioCollection.get();
    let ids = [];
    portfolios.forEach((portfolio) => {
      ids.push(portfolio.id);
    });
    setAllPortfolioIds(ids);
  }

  async function getPortfolioTickerList() {
    const tickerList = await getDoc(tickerListDocRef);
    if (tickerList.exists()) {
      setTickerList(tickerList.data().tickerList);
      setTickersNotInTradingView(tickerList.data().tickersNotInTradingView);
      setTickersInTradingView(tickerList.data().tickersInTradingView);
      return tickerList.data().tickerList;
    }
  }

  async function addTicker(ticker) {
    if (!tickerList[ticker.apiSymbol]) {
      console.log(ticker);
      await updateDoc(tickerListDocRef, {
        [`tickerList.${ticker.apiSymbol}`]: ticker.displayName,
      });
    }
  }

  async function addTickerToNotInTradingView(ticker) {
    if (!tickersNotInTradingView.includes(ticker)) {
      console.log(`Added ${ticker} to NOT in tradingView`);
      await updateDoc(tickerListDocRef, {
        tickersNotInTradingView: arrayUnion(ticker)
      });
    }
    
  }

  async function addTickerToInTradingView(ticker) {
    if (!tickersInTradingView.includes(ticker)) {
      console.log(`Added ${ticker} to IN tradingView`);
      await updateDoc(tickerListDocRef, {
        tickersInTradingView: arrayUnion(ticker)
      });
    }
  }
  

  async function getPortfolio(portfolioId) {
    const docRef = doc(db, "portfolios", portfolioId);
    const portfolio = await getDoc(docRef);
    if (portfolio.exists()) {
      return portfolio.data();
    }
  }

  async function addPosition(position, portfolioName) {
    const portfolioPositionsRef = doc(db, "portfolios", portfolioName);
    console.log(position)
    await updateDoc(portfolioPositionsRef, {
      positions: arrayUnion(position),
    });
  }

  async function updatePosition(originalPosition, newPosition, portfolioName) {
    const portfolioPositionsRef = doc(db, "portfolios", portfolioName);
    await updateDoc(portfolioPositionsRef, {
      positions: arrayRemove(originalPosition),
    });
    await updateDoc(portfolioPositionsRef, {
      positions: arrayUnion(newPosition),
    });
  }

  async function removePositionFromFirebase(position, portfolioName) {
    const portfolioPositionsRef = doc(db, "portfolios", portfolioName);
    await updateDoc(portfolioPositionsRef, {
      positions: arrayRemove(position),
    });
  }

  async function recordPortfolioValue(record, portfolioName) {
    const portfolioPositionsRef = doc(db, "portfolios", portfolioName);
    await updateDoc(portfolioPositionsRef, {
      portfolioValueHistory: arrayUnion(record),
    });
  }

  async function cleanupDuplicatesInHistorical(portfolioName) {
    const docRef = doc(db, "portfolios", portfolioName);
    const portfolio = await getDoc(docRef);
    let duplicatePricePoints = [];
    const portfolioValueHistory = portfolio.data().portfolioValueHistory;
    if (portfolio.exists()) {
      let prev = 0;
      portfolioValueHistory.forEach((pricePoint) => {
        if (prev === 0) {
          prev = pricePoint.value;
        } else if (prev === pricePoint.value) {
          duplicatePricePoints.push(pricePoint);
        }
        prev = pricePoint.value;
      });
    }
    if (duplicatePricePoints.length !== 0) {
      await updateDoc(docRef, {
        portfolioValueHistory: arrayRemove(...duplicatePricePoints),
      });
    }
  }

  async function recordPortfolioPositionValues(positions, positionValues ,portfolioName){
    // const portfolioPositionsRef = doc(db, "portfolios", portfolioName);
    let portfolioPositionsRef = db.collection('portfolios').doc(portfolioName);
    positions.forEach(position => {
      positionValues.forEach(positionValue => {
        if(position.symbol+position.quantity+position.type === positionValue.id){
          console.log(`Position: ${position.symbol}`)
          let positionValueHistory = position.valueHistory;
          
          positionValueHistory.push(PricePoint(getCurrentDate(), positionValue.value))
          let updatedPosition = {
              quantity: position.quantity,
              symbol: position.symbol,
              type: position.type,
              valueHistory: positionValueHistory
            }
          const response = portfolioPositionsRef.update("positions", FieldValue.arrayUnion(updatedPosition))
          console.log(response)
          // updateDoc(portfolioPositionsRef, updatedPosition)
          // updateDoc(portfolioPositionsRef, {
          //   positions: arrayUnion({
          //     quantity: position.quantity,
          //     symbol: position.symbol,
          //     type: position.type,
          //     valueHistory: positionValueHistory
          //   }),
          // });
        }
      })
      
    })
    
  }

  // USER FUNCTIONALITY

  async function fetchAllUsers() {
    await dbUsersCollection.get().then((snapshot) => {
      if (snapshot.docs.length > 0) {
        const tempUsers = [];
        snapshot.docs.forEach((user) => {
          if (user.data().email === currentUser.email) {
            setActiveUser(user.data());
            setNotifications(user.data().notifications);
          }
          tempUsers.push({
            id: user.data().id,
            firstName: user.data().firstName ? user.data().firstName : "",
            lastName: user.data().lastName ? user.data().lastName : "",
            photo: user.data().photo ? user.data().photo : "",
            friends: user.data().friends ? user.data().friends : [],
            notifications: user.data().notifications
              ? user.data().notifications
              : [],
            username: user.data().username,
          });
        });
        setAllUsers(tempUsers);
      }
    });
  }

  async function refreshUser(id) {
    const docRef = doc(db, "users", id);
    const user = await getDoc(docRef);
    if (user.exists()) {
      setActiveUser(user.data());
    }
  }

  async function getActiveUser() {
    const data = await dbUsersCollection.get();
    data.docs.forEach((item) => {
      if (item.data().email === currentUser.email) {
        setActiveUser(item.data());
      }
    });
  }

  const value = {
    allUsers,
    activeUser,
    getActiveUser,
    notifications,
    refreshUser,
    allPortfolioIds,
    getPortfolio,
    addPosition,
    removePositionFromFirebase,
    recordPortfolioValue,
    cleanupDuplicatesInHistorical,
    tickerList,
    addTicker,
    getPortfolioTickerList,
    createPortfolio,
    updatePosition,
    fetchAllUsers,
    getCurrentDate,
    recordPortfolioPositionValues,
    addTickerToNotInTradingView,
    tickersInTradingView,
    tickersNotInTradingView,
    addTickerToInTradingView
  };

  return (
    <FirestoreContext.Provider value={value}>
      {!loading && children}
    </FirestoreContext.Provider>
  );
}
