import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { addCommaToNumberString } from './CryptoPortfolio';
import { useFirestore } from "../../contexts/FirestoreContext";


// TradingViewWidget.jsx
let tvScriptLoadingPromise;

export function TradingViewWidget({ selectedTicker}) {
  const onLoadScriptRef = useRef();
  const [width, setWidth] = useState(window.innerWidth * 0.9);
  const [height, setHeight] = useState(window.innerHeight * 0.5);
  


  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    window.addEventListener('resize', handleResize);

    return () => {
      onLoadScriptRef.current = null;
      window.removeEventListener('resize', handleResize);
    };

    function createWidget() {
        const symbol = `BINANCE:${selectedTicker}USDT`;
      
        if (document.getElementById('tradingview_f7702') && 'TradingView' in window) {
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
            range: "1D",
            allow_symbol_change: true,
            save_image: false,
            details: true,
            studies: ["STD;EMA"],
            container_id: "tradingview_f7702"
          });
        }
      }

    function handleResize() {
      setWidth(window.innerWidth * 0.9);
      setHeight(window.innerHeight * 0.5);
    }
  }, [selectedTicker, width, height]);

  return (
    <div className='tradingview-widget-container'>
      <div id='tradingview_f7702' />
      
    </div>
  );
}



export default function TickerPriceChart ({ coinData, setShowModal }){
    const { tickersNotInTradingView, tickersInTradingView, addTickerToNotInTradingView, addTickerToInTradingView } = useFirestore();
    const {
        positionTickerPnLLists
      } = useCryptoOracle();
      const [open, setOpen] = useState(true);

      useEffect(() => {
          if((tickersInTradingView.includes(coinData.symbol) || !tickersNotInTradingView.includes(coinData.symbol))){
            const script = document.createElement('script');
            script.src = 'https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js';
            script.async = true;
            document.body.appendChild(script);
            return () => {
              document.body.removeChild(script);
            }
          }
      }, []);

      function onYesButtonClicked(){
        addTickerToInTradingView(coinData.symbol)
      }
      function onNoButtonClicked(){
        addTickerToNotInTradingView(coinData.symbol)
      }

  return (
    <Transition show={open} as={Fragment}>
  <Dialog
    as="div"
    className="fixed inset-0 z-10 overflow-y-auto"
    onClose={() => setShowModal(false)}
  >
    {tickersNotInTradingView && <div className="min-h-screen px-4 text-center">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-80" />

      <div className="inline-block mt-6 align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full md:w-9/12 ">
        <div className="bg-slate-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                    <img src={coinData.image} alt={coinData.name} className="w-8 h-8 rounded-full" />
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
            <p className="text-sm text-gray-300 opacity-65 border-b">
                Last updated at {new Date(coinData.last_updated).toLocaleTimeString([], {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})}
            </p>
            {(tickersInTradingView.includes(coinData.symbol) || !tickersNotInTradingView.includes(coinData.symbol)) ? <TradingViewWidget selectedTicker={coinData.symbol} onClick={(e) => e.preventDefault()}/> 
            :
            <coingecko-coin-price-chart-widget
                currency="usd"
                coin-id={coinData.id}
                locale="en"
                height="225"
                onClick={(e) => e.preventDefault()}
            ></coingecko-coin-price-chart-widget>}
            {(!tickersInTradingView.includes(coinData.symbol) && !tickersNotInTradingView.includes(coinData.symbol)) && <div className="text-sm text-gray-300 mt-2 flex flex-col items-center justify-center">
                <div className="mb-2">
                    Does this chart work? Your feedback would help others
                </div>
                <div className="flex">
                    <button className="text-black bg-slate-400 rounded-l-lg py-2 px-4" onClick={() => {onYesButtonClicked()}}>
                    Yes
                    </button>
                    <button className="text-black bg-slate-400 rounded-r-lg py-2 px-4 ml-1" onClick={() => {onNoButtonClicked()}}>
                    No
                    </button>
                </div>
            </div>}

                <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <div className="flex flex-col gap-2">
                    <table className="table-auto">
                        <tbody>
                            
                                <tr>
                                <td className="text-md text-white">Market Cap:</td>
                                <td className={`text-sm text-white`}>{coinData.market_cap ? `$${addCommaToNumberString(coinData.market_cap.toLocaleString())}` : "-"}</td>
                                </tr>
                                <tr>
                                <td className="text-md text-white">Market Cap Rank:</td>
                                <td className={`text-sm text-white`}>{coinData.market_cap_rank ? `#${addCommaToNumberString(coinData.market_cap_rank)}` : "-"}</td>
                                </tr>
                                <tr>
                                <td className="text-md text-white">Fully Diluted Valuation:</td>
                                <td className={`text-sm text-white`}>{coinData.fully_diluted_valuation ? `$${addCommaToNumberString(coinData.fully_diluted_valuation)}` : "-"}</td>
                                </tr>
                                <tr>
                                <td className="text-md text-white">Total Supply:</td>
                                <td className={`text-sm text-white`}>{coinData.total_supply ? addCommaToNumberString((coinData.total_supply).toFixed(2)) : "-"}</td>
                                </tr>
                                <tr>
                                    <td className="text-md text-white">Circulating/Max Supply:</td>
                                    <td className={`text-sm ${coinData.circulating_supply && coinData.max_supply ? (coinData.circulating_supply/coinData.max_supply > 0.8 ? 'text-green-500' : (coinData.circulating_supply/coinData.max_supply < 0.2 ? 'text-red-500' : 'text-yellow-500')) : 'text-gray-500'}`}>
                                        {coinData.circulating_supply && coinData.max_supply ? addCommaToNumberString((coinData.circulating_supply/coinData.max_supply).toFixed(2)) : "-"}
                                    </td>
                                </tr>



                            <tr>
                                <td className="text-md text-white">All-Time High:</td>
                                <td className={`text-sm text-white`}>${coinData.ath ? addCommaToNumberString(coinData.ath.toFixed(2)) : '-'}</td>
                            </tr>
                            <tr>
                                <td className={`text-md text-white`}>% from ATH:</td>
                                <td className={`text-sm ${coinData.ath_change_percentage ? coinData.ath_change_percentage < 0 ? 'text-red-500' : 'text-green-500' : ''}`}>{coinData.ath_change_percentage ? addCommaToNumberString(coinData.ath_change_percentage.toFixed(2)) + '%' : '-'}</td>
                            </tr>
                            <tr>
                                <td className={`text-md text-white`}>24h MCap Change:</td>
                                <td className={`text-sm ${coinData.market_cap_change_percentage_24h ? coinData.market_cap_change_percentage_24h < 0 ? 'text-red-500' : 'text-green-500' : ''}`}>{coinData.market_cap_change_percentage_24h ? addCommaToNumberString(coinData.market_cap_change_percentage_24h.toFixed(2)) + '%' : '-'}</td>
                            </tr>
                            <tr>
                                <td className={`text-md text-white`}>1h Price Change:</td>
                                <td className={`text-sm ${coinData.price_change_percentage_1h_in_currency ? coinData.price_change_percentage_1h_in_currency < 0 ? 'text-red-500' : 'text-green-500' : ''}`}>{coinData.price_change_percentage_1h_in_currency ? addCommaToNumberString(coinData.price_change_percentage_1h_in_currency.toFixed(2)) + '%' : '-'}</td>
                            </tr>
                            <tr>
                                <td className={`text-md text-white`}>24h Price Change:</td>
                                <td className={`text-sm ${coinData.price_change_percentage_24h_in_currency ? coinData.price_change_percentage_24h_in_currency < 0 ? 'text-red-500' : 'text-green-500' : ''}`}>{coinData.price_change_percentage_24h_in_currency ? addCommaToNumberString(coinData.price_change_percentage_24h_in_currency.toFixed(2)) + '%' : '-'}</td>
                            </tr>
                            <tr>
                                <td className={`text-md text-white`}>1w Price Change:</td>
                                <td className={`text-sm ${coinData.price_change_percentage_7d_in_currency ? coinData.price_change_percentage_7d_in_currency < 0 ? 'text-red-500' : 'text-green-500' : ''}`}>{coinData.price_change_percentage_7d_in_currency ? addCommaToNumberString(coinData.price_change_percentage_7d_in_currency.toFixed(2)) + '%' : '-'}</td>
                            </tr>

                        </tbody>
                        </table>
                    </div>
                </div>
              </div>
            </div>
          </div>}
        </Dialog>
      </Transition>
    )
}
