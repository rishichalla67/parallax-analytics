import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { useCryptoOracle } from "../../contexts/CryptoContext";

function TrendingCoins() {
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const {
    nomicsTickers,
    portfolioPositions,
    positionTickerPnLLists,
    getTickerPriceChart,
    portfolioValue,
  } = useCryptoOracle();

  useEffect(() => {
    axios
      .get("https://api.coingecko.com/api/v3/search/trending")
      .then((response) => {
        setCoins(response.data.coins);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const openModal = (coin) => {
    setSelectedCoin(coin);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {nomicsTickers &&
        coins.map((coin) => (
          <div
            key={coin.item.id}
            className="flex pt-2 items-center p-4 bg-black shadow rounded cursor-pointer hover:bg-slate-800 transition-colors duration-200 ease-in-out"
            onClick={() => openModal(coin.item)}
          >
            <img
              src={coin.item.small}
              alt={coin.item.name}
              className="w-16 h-16 mr-4"
            />
            <div className="flex flex-col justify-between h-full">
              <p className="text-lg font-semibold">
                {coin.item.name} ({coin.item.symbol.toUpperCase()})
              </p>
              <p className="text-sm text-gray-500">
                Price: ${coin.item.price_btc * nomicsTickers?.bitcoin?.usd}
              </p>
            </div>
          </div>
        ))}

      {selectedCoin && (
        <Transition appear show={isOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={closeModal}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 backdrop-filter backdrop-blur-sm" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform text-white bg-black shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white text-bold"
                  >
                    {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                  </Dialog.Title>

                  <div className="mt-2">
                    <img
                      src={selectedCoin.large}
                      alt={selectedCoin.name}
                      className="w-32 h-32 mx-auto mb-4"
                    />
                    <p>ID: {selectedCoin.id}</p>
                    <p>Market Cap Rank: {selectedCoin.market_cap_rank}</p>
                    <p>Price BTC: {selectedCoin.price_btc}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
}

export default TrendingCoins;
