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
import debounce from "lodash.debounce";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Ticker } from "../../Classes/Ticker";
import Nav from "../Nav.js";

export default function CryptoPortfolio() {
  const symbolRef = useRef();
  const quantityRef = useRef();
  const typeRef = useRef();
  const searchRef = useRef();
  const updateQuantityRef = useRef();
  const updateTypeRef = useRef();

  let timer = 0;

  const [tabIndex, setTabIndex] = useState(1);
  const [dateIndex, setDateIndex] = useState("1D");

  const [error, setError] = useState("");
  const [selectedPosition, setSelectedPosition] = useState();
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState("invisible");

  const [disable, setDisable] = useState(true);
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  const [editPositions, setEditPositions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const cancelButtonRef = useRef(null);
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
    dateByRange,
    setCurrentChartDateRange,
    currentChartDateRange,
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

  // const [filteredPortfolioValueHistory, setFilteredPortfolioValueHistory] =
  //   useState(portfolioValueHistory);

  // dateByRange(portfolioValueHistory, currentChartDateRange);
  useEffect(() => {
    setLoading(true);
    getPortfolioData();
    fetchAllUsers();
    dateByRange(portfolioValueHistory, currentChartDateRange);
    const interval = setInterval(() => {
      refreshOraclePrices();
    }, 300000);

    setLoading(false);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [currentChartDateRange]);

  function removePosition(position) {
    if (portfolioPositions.length > 0) {
      let index = portfolioPositions.indexOf(position);
      if (index !== -1) {
        portfolioPositions.splice(index, 1);
      }
      removePositionFromFirebase(position, activeUser.portfolioID);
    }
    setPortfolioValue(
      parseFloat(
        portfolioValue -
          parseFloat(position.quantity) * nomicsTickers[position.symbol].usd
      ).toFixed(2)
    );
    setShowModal(false);
    setChecked(false);
  }

  function findMaxValue(data) {
    let highest = 0;
    data.map((item) => {
      if (parseInt(item.value * 1.0) > highest) {
        highest = parseInt(item.value * 1.0);
      }
    });
    return highest;
  }

  function findMinValue(data) {
    let lowest = data[0].value;
    data.map((item) => {
      if (parseInt(item.value * 1.0) < lowest) {
        lowest = parseInt(item.value * 1.0);
      }
    });
    return lowest;
  }

  const debouncedChangeHandler = useCallback(
    debounce(handleSearchSubmit, 300),
    []
  );

  // async function recordPortfolioPositionValues(){
  //   // No positions
  //   if(portfolioPositions.length == 0){
  //       return;
  //   }
  //   // Has positions
  //   // updatePosition(originalPosition, newPosition, portfolioName)
  //   portfolioPositions.map((portPosition) => {
  //       let temp = {...portPosition};
  //       temp.valueHistory.push(PricePoint(getCurrentDate(), calculatePositionPrice(temp)))
  //       updatePosition(portPosition, temp, activeUser.portfolioID);
  //       console.log(temp)
  //   })
  // }

  async function handleSearchSubmit() {
    await searchCoinGeckoAPI(searchRef.current.value);
  }

  async function submitCreateNewPortfolio() {
    await createPortfolio(activeUser.username, activeUser.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    let positionToAdd = Position(
      symbolRef.current.value,
      quantityRef.current.value,
      typeRef.current.value
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
    setLoading(false);
  }

  function autofillAddPosition(value) {
    symbolRef.current.value = value;
  }

  function addCommaToNumberString(numberString) {
    var parts = numberString.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  async function updateSelectedPosition(e) {
    e.preventDefault();

    await updatePosition(
      selectedPosition,
      Position(
        selectedPosition.symbol,
        updateQuantityRef.current.value === ""
          ? selectedPosition.quantity
          : updateQuantityRef.current.value,
        updateTypeRef.current.value === ""
          ? selectedPosition.type
          : updateTypeRef.current.value
      ),
      activeUser.portfolioID
    );

    setShowModal(false);
    setChecked(false);
    setDisable(true);
    refreshOraclePrices();
  }

  function calculatePositionValue(position) {
    if (nomicsTickers[position.symbol] !== undefined) {
      return (
        parseFloat(position.quantity) *
        parseFloat(nomicsTickers[position.symbol].usd)
      ).toFixed(2);
    }
  }

  const refreshAll = () => {
    if (refreshAvailable) {
      setRefreshAvailable(false);
      refreshOraclePrices().then(getPortfolioData());

      timer = setTimeout(() => {
        setRefreshAvailable(true);
        console.log(refreshAvailable);
      }, 10000);
    }
  };

  function checkToDisable() {
    if (
      updateQuantityRef.current.value === "" &&
      updateTypeRef.current.value === ""
    ) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }

  function calculatePnl(data) {
    return (
      ((data[data.length - 1].value - data[0].value) /
        data[data.length - 1].value) *
      100
    ).toFixed(2);
  }

  const selectDateRange = (range) => {
    console.log(range);
    setCurrentChartDateRange(range);
    dateByRange(portfolioValueHistory, currentChartDateRange);
  };

  if (!activeUser.id) {
    return (
      <div className="h-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900"></div>
    );
  }

  return (
    <>
      <Nav />
      <div className="h-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <div className="text-white grid place-items-center">
          {activeUser.portfolioID ? (
            <div className="bg-black min-w-95% min-h-98vh md:max-w-5xl rounded-lg border border-sky-500 shadow-lg items-center ">
              <div className="flex justify-center px-4 py-1 sm:px-6"></div>
              {error && (
                <div role="alert">
                  <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                    Error
                  </div>
                  <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              )}
              {showModal && (
                <Transition.Root show={showModal} as={Fragment}>
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

                    <div className="fixed inset-0  z-10 overflow-y-auto">
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
                          <Dialog.Panel className="flex h-full justify-center transform overflow-hidden rounded-lg bg-black text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <form
                              className={`h-full p-4 md:mt-8 mx-8`}
                              action="#"
                              // onSubmit={}
                            >
                              <div className="text-white rounded-md shadow-sm -space-y-px">
                                <h3 className="flex justify-center text-2xl font-bold text-sky-400">{`Edit ${
                                  tickerList[selectedPosition.symbol]
                                } Position`}</h3>
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
                                    type="number"
                                    onChange={checkToDisable}
                                    ref={updateQuantityRef}
                                    autoComplete="quantity"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder={selectedPosition.quantity}
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
                                    type="text"
                                    onChange={checkToDisable}
                                    ref={updateTypeRef}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder={selectedPosition.type}
                                  />
                                </div>
                                <div>
                                  <label className="flex justify-center text-white text-sm font-medium py-4 px-4 rounded">
                                    <input
                                      type="checkbox"
                                      className="rounded w-4 h-4"
                                      defaultChecked={checked}
                                      onChange={() => {
                                        setChecked(!checked);
                                      }}
                                    />
                                    <a className="pl-2 leading-3">
                                      I understand that once the position is
                                      deleted, there is no way to revert
                                    </a>
                                  </label>
                                </div>
                                <div
                                  className={`flex justify-center pt-4 min-h-90% ${
                                    checked ? "disabled" : ""
                                  }`}
                                >
                                  <button
                                    type="delete"
                                    onClick={() => {
                                      // setShowForm("invisible");
                                      removePosition(selectedPosition);
                                      setSuccessMessage(
                                        "Successfully removed " +
                                          selectedPosition.symbol +
                                          " from positions."
                                      );
                                    }}
                                    className={`${
                                      checked
                                        ? "bg-red-500 hover:bg-red-700"
                                        : "bg-red-700 opacity-40"
                                    } text-black font-bold w-2/5 py-2 px-4 rounded`}
                                    disabled={!checked}
                                  >
                                    Delete Position
                                  </button>
                                </div>
                                <div className="flex justify-center space-x-5 py-4 px-2 min-h-90%">
                                  <div className="pt-2 pb-2">
                                    <button
                                      type="submit"
                                      onClick={(e) => {
                                        // setShowForm("invisible");
                                        updateSelectedPosition(e);
                                      }}
                                      className={`${
                                        disable
                                          ? "bg-sky-700 opacity-40"
                                          : "bg-sky-500 hover:bg-sky-300"
                                      } text-black font-bold py-2 px-4 rounded`}
                                      disabled={disable}
                                    >
                                      Save
                                    </button>
                                  </div>
                                  <div className="pt-2 pb-2">
                                    <button
                                      className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded"
                                      onClick={() => {
                                        setShowModal(false);
                                        setChecked(false);
                                        setDisable(true);
                                      }}
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
              )}
              {successMessage && (
                <div
                  role="alert"
                  onClick={() => {
                    setSuccessMessage("");
                  }}
                >
                  <div className="bg-green-500 text-black font-bold rounded-t px-4 py-2">
                    Success!
                  </div>
                  <div className="border border-t-0 border-green-400 rounded-b bg-green-300 px-4 py-3 text-black">
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-center border-b pb-2 border-gray-200">
                <h3 className="hidden sm:inline pt-1 text-xl pl-4 leading-6 font-medium">
                  Portfolio Value:
                </h3>
                <h3 className="sm:hidden pt-1 text-xl pl-2 leading-6 font-small">
                  Value:
                </h3>
                <h3 className="pl-2 pt-1 flex grow text-xl leading-6 font-small sm:font-medium">
                  {`$${addCommaToNumberString(portfolioValue)}`}
                  {(filteredPortfolioValueHistory.length > 0 ||
                    portfolioValueHistory.length > 0) && (
                    <div
                      className={`pl-2 sm:pl-3 pb-1 leading-6 ${
                        (
                          filteredPortfolioValueHistory.length > 0
                            ? calculatePnl(filteredPortfolioValueHistory) > 0
                            : calculatePnl(portfolioValueHistory) > 0
                        )
                          ? "text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      {`$${
                        // Get the $ Value of the pnl %
                        filteredPortfolioValueHistory.length > 0
                          ? addCommaToNumberString(
                              (
                                (calculatePnl(filteredPortfolioValueHistory) /
                                  100) *
                                filteredPortfolioValueHistory[
                                  filteredPortfolioValueHistory.length - 1
                                ].value
                              )
                                .toFixed(2)
                                .toString()
                            )
                          : addCommaToNumberString(
                              (
                                (calculatePnl(portfolioValueHistory) / 100) *
                                portfolioValueHistory[
                                  portfolioValueHistory.length - 1
                                ].value
                              )
                                .toFixed(2)
                                .toString()
                            )
                      }      (${
                        // Get the Pnl as a percentage
                        filteredPortfolioValueHistory.length > 0
                          ? calculatePnl(filteredPortfolioValueHistory)
                          : calculatePnl(portfolioValueHistory)
                      }%)`}
                    </div>
                  )}
                </h3>

                {refreshAvailable && (
                  <div className="pl-7 pt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#0092ff"
                      className={`w-6 h-6 hover:cursor-pointer mr-4`}
                      onClick={() => {
                        refreshAll();
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {!editPositions ? (
                <div className="flex flex-col justify-center px-4 py-5 sm:px-6 pt-10 border-gray-200">
                  <div className="justify-end hidden md:flex">
                    <div className=" text-center">
                      <button
                        onClick={() => {
                          selectDateRange("1D");
                          setDateIndex("1D");
                        }}
                        className={`inline-block p-4 ${
                          dateIndex === "1D"
                            ? "text-white bg-purple-900 font-bold m-2 py-2 px-4 rounded"
                            : "text-sky-500 hover:bg-purple-900 font-bold m-2 py-2 px-2 rounded"
                        }`}
                      >
                        1D
                      </button>
                      <button
                        onClick={() => {
                          selectDateRange("1W");
                          setDateIndex("1W");
                        }}
                        className={`inline-block p-4 ${
                          dateIndex === "1W"
                            ? "text-white bg-purple-900 font-bold m-2 py-2 px-4 rounded"
                            : "text-sky-500 hover:bg-purple-900 font-bold m-2 py-2 px-2 rounded"
                        }`}
                      >
                        1W
                      </button>
                      <button
                        onClick={() => {
                          selectDateRange("1M");
                          setDateIndex("1M");
                        }}
                        className={`inline-block p-4 ${
                          dateIndex === "1M"
                            ? "text-white bg-purple-900 font-bold m-2 py-2 px-4 rounded"
                            : "text-sky-500 hover:bg-purple-900 font-bold m-2 py-2 px-2 rounded"
                        }`}
                      >
                        1M
                      </button>
                      <button
                        onClick={() => {
                          selectDateRange("1Y");
                          setDateIndex("1Y");
                        }}
                        className={`inline-block p-4 ${
                          dateIndex === "1Y"
                            ? "text-white bg-purple-900 font-bold m-2 py-2 px-4 rounded"
                            : "text-sky-500 hover:bg-purple-900 font-bold m-2 py-2 px-3 rounded"
                        }`}
                      >
                        1Y
                      </button>
                    </div>
                  </div>
                  {portfolioValueHistory.length > 0 && (
                    <>
                      <div className="flex justify-center w-full">
                        <ResponsiveContainer width="100%" height={300 || 250}>
                          <LineChart
                            data={
                              filteredPortfolioValueHistory.length > 0
                                ? filteredPortfolioValueHistory
                                : portfolioValueHistory
                            }
                          >
                            <XAxis dataKey="date" />
                            <YAxis
                              dataKey="value"
                              tickLine={{ stroke: "#0092ff" }}
                              domain={[
                                // filterDataByRange(portfolioValueHistory, currentChartDateRange)[0].value
                                filteredPortfolioValueHistory.length > 0
                                  ? parseInt(
                                      findMinValue(
                                        filteredPortfolioValueHistory
                                      ) * 0.99
                                    )
                                  : parseInt(
                                      findMinValue(portfolioValueHistory) * 0.99
                                    ), // lower bound
                                filteredPortfolioValueHistory.length > 0
                                  ? parseInt(
                                      findMaxValue(
                                        filteredPortfolioValueHistory
                                      ) * 1.01
                                    )
                                  : parseInt(
                                      findMaxValue(portfolioValueHistory) * 1.01
                                    ),
                              ]}
                            />
                            <Tooltip
                              style={{ color: "red" }}
                              contentStyle={{ backgroundColor: "#000000" }}
                              itemStyle={{ color: "#FFFFFF" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#0092ff"
                              dot={false}
                              activeDot={true}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                  <ul className="flex flex-wrap text-lg md:text-xl font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    <li className="mr-2">
                      <button
                        onClick={() => {
                          setTabIndex(1);
                        }}
                        aria-current="page"
                        className={`inline-block p-4 ${
                          tabIndex !== 1
                            ? "rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            : "text-slate-200 bg-gray-100 rounded-t-lg active dark:bg-gray-800"
                        }`}
                      >
                        Positions
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => {
                          setTabIndex(2);
                        }}
                        data-bs-toggle="tooltip"
                        title="Coming Soon..."
                        className={`inline-block p-4 ${
                          tabIndex !== 2
                            ? "rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            : "text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
                        }`}
                      >
                        Analytics
                      </button>
                    </li>
                  </ul>

                  {/* Tab Index of 1 === Positions Table */}
                  {tabIndex === 1 && (
                    <>
                      <div className="flex pb-2 border border-gray-200">
                        {/* <a className="pl-3 text-white-500 text-2xl">-</a> */}
                        <h3 className="pl-3 pt-2 text-xl leading-6 text-sky-500 font-medium">
                          Crypto
                        </h3>
                        <div className="grow pt-2 pr-3 text-xl leading-6 text-sky-500 font-medium text-right">
                          Value
                        </div>
                      </div>
                      {portfolioPositions.map((position) => {
                        return (
                          <div
                            key={`${position.symbol}-${position.quantity}-${position.type}`}
                            className="flex pb-2 border border-gray-200 hover:text-sky-400 hover:cursor-pointer"
                            onClick={() => {
                              setShowModal(true);
                              setSelectedPosition(position);
                            }}
                          >
                            <h3 className="pl-3 pt-2 text-xl leading-6 font-medium">{`${
                              tickerList[position.symbol]
                            } (${position.type.toLowerCase()})`}</h3>
                            <div className="grow pt-2 pr-1 text-xl leading-6 font-medium text-right">
                              {`$${addCommaToNumberString(
                                calculatePositionValue(position)
                              )}`}
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2">
                        <button
                          className="bg-sky-500 hover:bg-sky-700 text-black font-bold py-2 px-4 rounded"
                          onClick={() => {
                            setEditPositions(true);
                          }}
                        >
                          Add Position
                        </button>
                      </div>
                    </>
                  )}

                  {/* Tab Index of 2 === Positions Table */}
                  {tabIndex === 2 && (
                    <>
                      <div className="flex pt-10 text-lg justify-center">
                        {/* <a className="pl-3 text-white-500 text-2xl">-</a> */}
                        Coming Soon...
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // If No Portfolio Created Yet
                <div>
                  <div
                    className="px-10 border-t"
                    action="#"
                    onSubmit={handleSubmit}
                  >
                    <div className="pt-4 sm:px-6">
                      {/* <h3 className="font-semibold pb-2"></h3> */}
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
                        // console.log(result)
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
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="examples: 'STAKE' or 'LP' or 'HOLD'"
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
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-black min-w-95% min-h-98vh md:max-w-5xl rounded-lg border border-slate-500 shadow-lg items-center ">
              <div className="px-4 py-5 sm:px-6">
                <div>
                  <h3 className="py-9 text-xl align-content-center leading-6 font-small">
                    It looks like this is your first time here...
                  </h3>
                </div>
                <div className="px-10 py-10 " action="#">
                  <div className="flex justify-center pt-4 sm:px-6">
                    {/* <h3 className="font-semibold pb-2"></h3> */}

                    {/* <input
                      id="search"
                      name="search"
                      autoComplete="off"
                      ref={portfolioNameRef}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Enter Portfolio Name"
                    /> */}
                    <button
                      className="bg-sky-500 hover:bg-sky-700 text-black font-bold py-2 px-4 rounded"
                      onClick={() => {
                        submitCreateNewPortfolio();
                      }}
                    >
                      Create Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
