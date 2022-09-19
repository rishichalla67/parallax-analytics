import React from "react";
import { useEffect, useContext, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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
    }

    setLoading(false);
  }, []);

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
      console.log(tickerList.data())
      setTickerList(tickerList.data().tickerList);
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

  async function getPortfolio(portfolioId) {
    const docRef = doc(db, "portfolios", portfolioId);
    const portfolio = await getDoc(docRef);
    if (portfolio.exists()) {
      return portfolio.data();
    }
  }

  async function addPosition(position, portfolioName) {
    const portfolioPositionsRef = doc(db, "portfolios", portfolioName);
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
  };

  return (
    <FirestoreContext.Provider value={value}>
      {!loading && children}
    </FirestoreContext.Provider>
  );
}
