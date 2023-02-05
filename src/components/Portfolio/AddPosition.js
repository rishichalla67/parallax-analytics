import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    Fragment,
  } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";
import { Position } from "../../Classes/Position";
import { Ticker } from "../../Classes/Ticker";
import debounce from "lodash.debounce";


export default function AddPosition({setError, setSuccessMessage, setEditPositions}){
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

    const symbolRef = useRef();
  const quantityRef = useRef();
  const typeRef = useRef();
  const avgCostRef = useRef();
  const searchRef = useRef();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const debouncedChangeHandler = useCallback(
    debounce(handleSearchSubmit, 300),
    []
  );

  async function handleSearchSubmit() {
    await searchCoinGeckoAPI(searchRef.current.value);
  }

  function autofillAddPosition(value) {
    symbolRef.current.value = value;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // setLoading(true);
    let positionToAdd = Position(
      symbolRef.current.value,
      quantityRef.current.value,
      typeRef.current.value,
      avgCostRef.current.value === "" ? avgCostRef.current.value : parseFloat(avgCostRef.current.value).toFixed(2)
    );
    portfolioPositions.push(positionToAdd);
    await addPosition(positionToAdd, activeUser.portfolioID).catch((err) =>
      setError(err.message)
    );
    setSuccessMessage(
      `Successfully added ${positionToAdd.symbol} to your positions`
    );
    refreshOraclePrices();
    setEditPositions(false);
    // setLoading(false);
  }

    

    return(
        <>
          <Transition.Root show={true} as={Fragment}>
        <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
        >
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 mt-16 z-10 overflow-y-auto">
            <div className="flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
                <Dialog.Panel className="flex h-full  justify-center transform overflow-hidden rounded-lg bg-black text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form
            className={`h-full p-4 md:mt-8 mx-8`}
            action="#"
            onSubmit={handleSubmit}
          >
            <div className="text-white rounded-md shadow-sm -space-y-px">
              <div
              className="px-10 "
            >
              <div className="pt-4 sm:pt-0 sm:px-6">
                <input
                  id="search"
                  name="search"
                  autoComplete="off"
                  onChange={debouncedChangeHandler}
                  ref={searchRef}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search CoinGecko API..."
                />
              </div>
            </div>
            <div className="sm:px-10 overflow-y-auto h-40">
            {searchResults &&
              searchResults.map((result) => {
                return (
                  <div
                    key={`${result.api_symbol}`}
                    className="flex justify-center hover:cursor-pointer hover:text-sky-400"
                    data-tooltip={`Select to start making a position`}
                  >
                    <div
                      onClick={() => {
                        autofillAddPosition(result.api_symbol);
                        addTicker(
                          Ticker(result.name, result.api_symbol)
                        );
                        // setShowForm("block");
                      }}
                      key={result.id}
                      className="pt-2"
                    >
                      {result.name}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="flex space-x-2 flex-row pt-3">
              <div>
                <h3 className="flex align-content-left pt-2 font-semibold">
                  Crypto Ticker
                </h3>
                <label htmlFor="Symbol" className="sr-only">
                  Symbol
                </label>
                <input
                  id="symbol"
                  name="symbol"
                  type="symbol"
                  ref={symbolRef}
                  required
                  readOnly
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-sky-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="ex. bitcoin"
                />
              </div>
              <div className="pt-2 ">
                <h3 className="flex align-content-left font-semibold">
                  Quantity
                </h3>
                <label htmlFor="quantity" className="sr-only">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="quantity"
                  ref={quantityRef}
                  autoComplete="quantity"
                  required
                  pattern="[0-9]+"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-sky-500"
                  placeholder="ex. 0.01"
                />
              </div>
            </div>
            <div className="flex space-x-2 flex-row pt-3">
              <div className="pt-2">
                <h3 className="flex align-content-left font-semibold">
                  Position Type
                </h3>
                <label htmlFor="type" className="sr-only">
                  Position Type
                </label>
                <input
                  id="type"
                  name="type"
                  type="type"
                  ref={typeRef}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-sky-500"
                  placeholder="ex. 'STAKE' or 'LP' or 'HOLD'"
                />
              </div>
              <div className="pt-2">
                <h3 className="flex align-content-left font-semibold">
                  Average Cost
                </h3>
                <label htmlFor="averageCost" className="sr-only">
                  Average Cost
                </label>
                <input
                  id="averageCost"
                  name="averageCost"
                  type="averageCost"
                  ref={avgCostRef}
                  required
                  pattern="^\d+(\.\d{1,2})?$"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-sky-500"
                  placeholder="ex. 3.25"
                />
              </div>
              </div>
              <div className="flex flex-col space-x-2 items-center justify-center">
                <div className="pt-4">
                  <button
                    type="submit"
                    onClick={() => {
                      // setShowForm("invisible");
                      // searchResults = [];
                    }}
                    className="bg-sky-500 hover:bg-sky-700 text-black font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    Add Position
                  </button>
                </div>
                
                <div className="pt-4">
                  <button
                    type="cancel"
                    onClick={() => {
                      setEditPositions(false);
                      
                    }}
                    className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
                </div>
            </div>
          </form>
                </Dialog.Panel>
            </Transition.Child>
            </div>
        </div>
        </Dialog>
    </Transition.Root>


















          {/* <div
            className="px-10 border-t"
            action="#"
            onSubmit={handleSubmit}
          >
            <div className="pt-4 sm:px-6">
              <input
                id="search"
                name="search"
                autoComplete="off"
                onChange={debouncedChangeHandler}
                ref={searchRef}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search CoinGecko API..."
              />
            </div>
          </div>
          <div className="px-10 overflow-y-auto h-48 border-b">
            {searchResults &&
              searchResults.map((result) => {
                return (
                  <div
                    key={`${result.api_symbol}`}
                    className="flex justify-center hover:cursor-pointer hover:text-sky-400"
                    data-tooltip={`Select to start making a position`}
                  >
                    <div
                      onClick={() => {
                        autofillAddPosition(result.api_symbol);
                        addTicker(
                          Ticker(result.name, result.api_symbol)
                        );
                        setShowForm("block");
                      }}
                      key={result.id}
                      className="pt-2"
                    >
                      {result.name}
                    </div>
                  </div>
                );
              })}
          </div>
          <form
            className={`mt-8 mx-8 ${showForm}`}
            action="#"
            onSubmit={handleSubmit}
          >
            <div className=" rounded-md shadow-sm -space-y-px">
              <div>
                <h3 className="flex align-content-left font-semibold">
                  Crypto Ticker
                </h3>
                <label htmlFor="Symbol" className="sr-only">
                  Symbol
                </label>
                <input
                  id="symbol"
                  name="symbol"
                  type="symbol"
                  ref={symbolRef}
                  required
                  readOnly
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="example: bitcoin"
                />
              </div>
              <div className="pt-2 ">
                <h3 className="flex align-content-left font-semibold">
                  Quantity
                </h3>
                <label htmlFor="quantity" className="sr-only">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="quantity"
                  ref={quantityRef}
                  autoComplete="quantity"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="example: .01"
                />
              </div>
              <div className="pt-2">
                <h3 className="flex align-content-left font-semibold">
                  Position Type
                </h3>
                <label htmlFor="type" className="sr-only">
                  Position Type
                </label>
                <input
                  id="type"
                  name="type"
                  type="type"
                  ref={typeRef}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="examples: 'STAKE' or 'LP' or 'HOLD'"
                />
              </div>
              <div className="pt-2">
                <h3 className="flex align-content-left font-semibold">
                  Average Cost
                </h3>
                <label htmlFor="averageCost" className="sr-only">
                  Average Cost
                </label>
                <input
                  id="averageCost"
                  name="averageCost"
                  type="averageCost"
                  ref={avgCostRef}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="example: 3.25"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  onClick={() => {
                    setShowForm("invisible");
                  }}
                  className="bg-sky-500 hover:bg-sky-700 text-black font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  Add Position
                </button>
              </div>
            </div>
          </form>
          <div className="pt-2 pb-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded"
              onClick={() => {
                setEditPositions(false);
                setError("");
                setSuccessMessage("");
                setShowForm("invisible");
              }}
            >
              Cancel
            </button>
          </div> */}
        </>
    );
};