import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { addCommaToNumberString } from "./CryptoPortfolio";
import { useFirestore } from "../../contexts/FirestoreContext";

// TradingViewWidget.jsx
let tvScriptLoadingPromise;

export function TradingViewWidget({ selectedTicker }) {
  const onLoadScriptRef = useRef();
  const [width, setWidth] = useState(window.innerWidth * 0.98);
  const [height, setHeight] = useState(window.innerHeight * 0.5);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    const cachedScript = document.getElementById("tradingview-widget-script");

    if (cachedScript) {
      onLoadScriptRef.current();
    } else {
      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement("script");
          script.id = "tradingview-widget-loading-script";
          script.src = "https://s3.tradingview.com/tv.js";
          script.type = "text/javascript";
          script.onload = resolve;

          document.head.appendChild(script);
        });
      }
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    window.addEventListener("resize", handleResize);

    return () => {
      onLoadScriptRef.current = null;
      window.removeEventListener("resize", handleResize);
    };

    function createWidget() {
      let symbol = "";
      if (selectedTicker === "kuji") {
        symbol = `MEXC:${selectedTicker}USDT`;
      } else {
        symbol = `BINANCE:${selectedTicker}USDT`;
      }
      if (
        document.getElementById("tradingview_f7702") &&
        "TradingView" in window
      ) {
        const widget = new window.TradingView.widget({
          width,
          height,
          symbol,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "9",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_legend: true,
          withdateranges: true,
          range: "YTD",
          allow_symbol_change: true,
          save_image: false,
          details: true,
          studies: ["STD;Bollinger_Bands", "STD;Ichimoku%1Cloud"],
          container_id: "tradingview_f7702",
        });
      }
    }

    function handleResize() {
      setWidth(window.innerWidth * 0.9);
      setHeight(window.innerHeight * 0.5);
    }
  }, [selectedTicker, width, height]);

  return (
    <div className="tradingview-widget-container">
      <div id="tradingview_f7702" />
    </div>
  );
}

export default function TickerPriceChart({ coinData, setShowModal }) {
  const {
    tickersNotInTradingView,
    tickersInTradingView,
    addTickerToNotInTradingView,
    addTickerToInTradingView,
  } = useFirestore();
  const [buttonsClicked, setButtonsClicked] = useState(false);
  const { positionTickerPnLLists } = useCryptoOracle();
  const [open, setOpen] = useState(true);
  const [showRatio, setShowRatio] = useState(true);

  let content;
  if (showRatio) {
    content =
      coinData.circulating_supply && coinData.max_supply ? (
        <div
          className={`text-lg font-bold ${
            coinData.circulating_supply / coinData.max_supply > 0.8
              ? "text-green-500"
              : coinData.circulating_supply / coinData.max_supply < 0.2
              ? "text-red-500"
              : "text-yellow-500"
          }`}
        >
          {addCommaToNumberString(
            (coinData.circulating_supply / coinData.max_supply).toFixed(2)
          )}
        </div>
      ) : (
        <div className="text-white">-</div>
      );
  } else {
    content =
      coinData.circulating_supply && coinData.max_supply ? (
        <div className="text-lg font-bold text-white">
          {addCommaToNumberString(coinData.circulating_supply.toFixed(0))} /{" "}
          {addCommaToNumberString(coinData.max_supply)}
        </div>
      ) : (
        <div className="text-white">-</div>
      );
  }

  function handleCMSClick() {
    setShowRatio(!showRatio);
  }

  useEffect(() => {
    const cachedScript = document.getElementById("coingecko-widget");

    if (cachedScript) {
      document.body.appendChild(cachedScript);
      return () => {};
    }

    const script = document.createElement("script");
    script.id = "coingecko-widget";
    script.src =
      "https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function onYesButtonClicked() {
    addTickerToInTradingView(coinData.symbol);
    setButtonsClicked(true);
  }
  function onNoButtonClicked() {
    addTickerToNotInTradingView(coinData.symbol);
    setButtonsClicked(true);
  }

  function NumberToggle({ value, sectionName }) {
    const [abbreviated, setAbbreviated] = useState(true);

    function handleClick() {
      setAbbreviated(!abbreviated);
    }

    const displayValue = abbreviated
      ? abbreviateNumber(value)
      : value.toLocaleString();

    return (
      <div
        className="bg-gray-800 p-4 rounded-lg shadow hover:cursor-pointer"
        onClick={handleClick}
      >
        <div className="text-sm font-medium text-gray-400 mb-2">
          {sectionName}
        </div>
        <div className="text-lg font-bold text-white">{displayValue}</div>
      </div>
    );
  }

  function abbreviateNumber(num) {
    const abbreviations = [
      { scale: 1e12, label: " trillion" },
      { scale: 1e9, label: " billion" },
      { scale: 1e6, label: " million" },
      { scale: 1e3, label: "k" },
      { scale: 1, label: "" },
    ];

    // Convert the input to a number if it's a string
    num = Number(num);

    // Find the appropriate abbreviation for the scale of the number
    let abbreviation;
    for (let i = 0; i < abbreviations.length; i++) {
      if (num >= abbreviations[i].scale) {
        abbreviation = abbreviations[i];
        break;
      }
    }

    // Calculate the rounded and abbreviated number
    const scale = abbreviation?.scale;
    const label = abbreviation?.label;
    const roundedNum = Math.floor(num / scale);
    const remainingDigits = Math.floor(num % scale);
    let formattedNumber = roundedNum;
    if (remainingDigits > 0) {
      const decimalDigits = Math.floor(remainingDigits / (scale / 100));
      formattedNumber += "." + decimalDigits;
    }
    formattedNumber += label;

    return formattedNumber;
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => setShowModal(false)}
      >
        {tickersNotInTradingView && (
          <div className="min-h-screen px-4 text-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />

            <div className="inline-block mt-2 align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full md:w-11/12 ">
              <div className="bg-slate-700 px-[.25rem] pt-2 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 pl-2">
                    <img
                      src={coinData.image}
                      alt={coinData.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <h3 className="text-2xl font-medium text-white mb-1 ml-2 text-center">
                      <b>{coinData.name}</b>
                    </h3>
                  </div>

                  <button
                    className="p-2 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={() => setShowModal(false)}
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-300 opacity-65 border-b pl-2">
                  Last updated at{" "}
                  {new Date(coinData.last_updated).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    hour12: true,
                  })}
                </p>
                {tickersInTradingView.includes(coinData.symbol) ||
                !tickersNotInTradingView.includes(coinData.symbol) ? (
                  <TradingViewWidget
                    selectedTicker={coinData.symbol}
                    onClick={(e) => e.preventDefault()}
                  />
                ) : (
                  <coingecko-coin-price-chart-widget
                    currency="usd"
                    coin-id={coinData.id}
                    locale="en"
                    height="225"
                    onClick={(e) => e.preventDefault()}
                  ></coingecko-coin-price-chart-widget>
                )}
                {!buttonsClicked &&
                  !tickersInTradingView.includes(coinData.symbol) &&
                  !tickersNotInTradingView.includes(coinData.symbol) && (
                    <div className="text-sm text-gray-300 mt-2 flex flex-col items-center justify-center">
                      <div className="mb-2">
                        Does this chart work? Your feedback would help others
                      </div>
                      <div className="flex">
                        <button
                          className="text-black bg-slate-400 rounded-l-lg py-2 px-4"
                          onClick={onYesButtonClicked}
                        >
                          Yes
                        </button>
                        <button
                          className="text-black bg-slate-400 rounded-r-lg py-2 px-4 ml-1"
                          onClick={onNoButtonClicked}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}

                <div className="flex flex-col md:flex-col gap-4 pt-2">
                  <div
                    className="flex flex-col gap-2 "
                    style={{ overflowX: "auto" }}
                  >
                    {/* <table className="table-auto">
                      <tbody>
                        <tr>
                          <td className="text-md text-white">Market Cap:</td>
                          <td className={`text-sm text-white`}>
                            {coinData.market_cap
                              ? `$${abbreviateNumber(coinData.market_cap)}`
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-md text-white">
                            Market Cap Rank:
                          </td>
                          <td className={`text-sm text-white`}>
                            {coinData.market_cap_rank
                              ? `#${addCommaToNumberString(
                                  coinData.market_cap_rank
                                )}`
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-md text-white">
                            Fully Diluted Valuation:
                          </td>
                          <td className={`text-sm text-white`}>
                            {coinData.fully_diluted_valuation
                              ? `$${abbreviateNumber(
                                  coinData.fully_diluted_valuation
                                )}`
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-md text-white">Total Supply:</td>
                          <td className={`text-sm text-white`}>
                            {coinData.total_supply
                              ? abbreviateNumber(
                                  coinData.total_supply.toFixed(2)
                                )
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-md text-white">
                            Circulating/Max Supply:
                          </td>
                          <td
                            className={`text-sm ${
                              coinData.circulating_supply && coinData.max_supply
                                ? coinData.circulating_supply /
                                    coinData.max_supply >
                                  0.8
                                  ? "text-green-500"
                                  : coinData.circulating_supply /
                                      coinData.max_supply <
                                    0.2
                                  ? "text-red-500"
                                  : "text-yellow-500"
                                : "text-gray-500"
                            }`}
                          >
                            {coinData.circulating_supply && coinData.max_supply
                              ? addCommaToNumberString(
                                  (
                                    coinData.circulating_supply /
                                    coinData.max_supply
                                  ).toFixed(2)
                                )
                              : "-"}
                          </td>
                        </tr>

                        <tr>
                          <td className="text-md text-white">All-Time High:</td>
                          <td className={`text-sm text-white`}>
                            $
                            {coinData.ath
                              ? addCommaToNumberString(coinData.ath.toFixed(2))
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className={`text-md text-white`}>% from ATH:</td>
                          <td
                            className={`text-sm ${
                              coinData.ath_change_percentage
                                ? coinData.ath_change_percentage < 0
                                  ? "text-red-500"
                                  : "text-green-500"
                                : ""
                            }`}
                          >
                            {coinData.ath_change_percentage
                              ? addCommaToNumberString(
                                  coinData.ath_change_percentage.toFixed(2)
                                ) + "%"
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className={`text-md text-white`}>
                            24h MCap Change:
                          </td>
                          <td
                            className={`text-sm ${
                              coinData.market_cap_change_percentage_24h
                                ? coinData.market_cap_change_percentage_24h < 0
                                  ? "text-red-500"
                                  : "text-green-500"
                                : ""
                            }`}
                          >
                            {coinData.market_cap_change_percentage_24h
                              ? addCommaToNumberString(
                                  coinData.market_cap_change_percentage_24h.toFixed(
                                    2
                                  )
                                ) + "%"
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className={`text-md text-white`}>
                            1h Price Change:
                          </td>
                          <td
                            className={`text-sm ${
                              coinData.price_change_percentage_1h_in_currency
                                ? coinData.price_change_percentage_1h_in_currency <
                                  0
                                  ? "text-red-500"
                                  : "text-green-500"
                                : ""
                            }`}
                          >
                            {coinData.price_change_percentage_1h_in_currency
                              ? addCommaToNumberString(
                                  coinData.price_change_percentage_1h_in_currency.toFixed(
                                    2
                                  )
                                ) + "%"
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className={`text-md text-white`}>
                            24h Price Change:
                          </td>
                          <td
                            className={`text-sm ${
                              coinData.price_change_percentage_24h_in_currency
                                ? coinData.price_change_percentage_24h_in_currency <
                                  0
                                  ? "text-red-500"
                                  : "text-green-500"
                                : ""
                            }`}
                          >
                            {coinData.price_change_percentage_24h_in_currency
                              ? addCommaToNumberString(
                                  coinData.price_change_percentage_24h_in_currency.toFixed(
                                    2
                                  )
                                ) + "%"
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className={`text-md text-white`}>
                            1w Price Change:
                          </td>
                          <td
                            className={`text-sm ${
                              coinData.price_change_percentage_7d_in_currency
                                ? coinData.price_change_percentage_7d_in_currency <
                                  0
                                  ? "text-red-500"
                                  : "text-green-500"
                                : ""
                            }`}
                          >
                            {coinData.price_change_percentage_7d_in_currency
                              ? addCommaToNumberString(
                                  coinData.price_change_percentage_7d_in_currency.toFixed(
                                    2
                                  )
                                ) + "%"
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table> */}
                    <div style={{ overflowX: "auto" }}>
                      <table className="w-full">
                        <thead>
                          <tr className="px-4 py-2 text-white flex-grow">
                            <th></th>
                            <th className="text-center">1h</th>
                            <th className="text-center">24h</th>
                            <th className="text-center">7d</th>
                            <th className="text-center">14d</th>
                            <th className="text-center">30d</th>
                            <th className="text-center">200d</th>
                            <th className="text-center">1y</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td className="text-center border text-xs px-4 sm:py-2 sm:text-md sm:font-medium text-gray-400">
                              Price Change
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_1h_in_currency
                                  ? coinData.price_change_percentage_1h_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_1h_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_1h_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_24h_in_currency
                                  ? coinData.price_change_percentage_24h_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_24h_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_24h_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_7d_in_currency
                                  ? coinData.price_change_percentage_7d_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_7d_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_7d_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_14d_in_currency
                                  ? coinData.price_change_percentage_14d_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_14d_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_14d_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_30d_in_currency
                                  ? coinData.price_change_percentage_30d_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_30d_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_30d_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_200d_in_currency
                                  ? coinData.price_change_percentage_200d_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_200d_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_200d_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                            <td
                              className={`text-center border px-4 sm:py-2 text-sm ${
                                coinData.price_change_percentage_1y_in_currency
                                  ? coinData.price_change_percentage_1y_in_currency <
                                    0
                                    ? "text-red-500"
                                    : "text-green-500"
                                  : ""
                              }`}
                            >
                              {coinData.price_change_percentage_1y_in_currency
                                ? addCommaToNumberString(
                                    coinData.price_change_percentage_1y_in_currency.toFixed(
                                      2
                                    )
                                  ) + "%"
                                : "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 pt-2">
                      <div className="bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-400 mb-2">
                          Market Cap Rank
                        </div>
                        <div className="text-lg font-bold text-white">
                          {coinData.market_cap_rank
                            ? `#${addCommaToNumberString(
                                coinData.market_cap_rank
                              )}`
                            : "-"}
                        </div>
                      </div>

                      <div>
                        <NumberToggle
                          value={coinData.market_cap}
                          sectionName={"Market Cap"}
                        />
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-400 mb-2">
                          24h MCap Change
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            coinData.market_cap_change_percentage_24h
                              ? coinData.market_cap_change_percentage_24h < 0
                                ? "text-red-500"
                                : "text-green-500"
                              : ""
                          }`}
                        >
                          {coinData.market_cap_change_percentage_24h
                            ? addCommaToNumberString(
                                coinData.market_cap_change_percentage_24h.toFixed(
                                  2
                                )
                              ) + "%"
                            : "-"}
                        </div>
                      </div>

                      <div>
                        <NumberToggle
                          value={coinData.fully_diluted_valuation}
                          sectionName={"FDV"}
                        />
                      </div>

                      <div>
                        <NumberToggle
                          value={coinData.total_supply}
                          sectionName={"Total Supply"}
                        />
                      </div>
                      <div>
                        <NumberToggle
                          value={coinData.total_volume}
                          sectionName={"Total Volume"}
                        />
                      </div>
                      <div
                        className="bg-gray-800 p-4 rounded-lg shadow hover:cursor-pointer"
                        onClick={handleCMSClick}
                      >
                        <div className="text-sm font-medium text-gray-400 mb-2">
                          Circulating/Max Supply
                        </div>
                        {content}
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg shadow">
                        <div class="mb-2">
                          <div class="text-sm font-medium text-gray-400">
                            All-Time High
                          </div>
                          <div class="text-xs text-gray-400">% from ATH</div>
                        </div>

                        <div className="text-lg font-bold text-white">
                          $
                          {coinData.ath
                            ? addCommaToNumberString(coinData.ath.toFixed(2))
                            : "-"}
                        </div>
                        <div
                          className={`text-sm ${
                            coinData.ath_change_percentage
                              ? coinData.ath_change_percentage < 0
                                ? "text-red-500"
                                : "text-green-500"
                              : ""
                          }`}
                        >
                          {coinData.ath_change_percentage
                            ? addCommaToNumberString(
                                coinData.ath_change_percentage.toFixed(2)
                              ) + "%"
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Transition>
  );
}
