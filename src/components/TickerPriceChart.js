import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useCryptoOracle } from "../contexts/CryptoContext";
import { addCommaToNumberString } from './Portfolio/CryptoPortfolio';


export default function TickerPriceChart ({ coinData, setShowModal }){
    const {
        positionTickerPnLLists
      } = useCryptoOracle();
      const [open, setOpen] = useState(true);


    
  return (
    <Transition show={open} as={Fragment}>
  <Dialog
    as="div"
    className="fixed inset-0 z-10 overflow-y-auto"
    onClose={() => setShowModal(false)}
  >
    <div className="min-h-screen px-4 text-center">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

      <div className="inline-block mt-20  align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full md:w-6/12">
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

                <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <div className="flex flex-col gap-2">
                    <table className="table-auto">
                        <tbody>
                            <tr>
                                <td className="text-md text-white">Current Price:</td>
                                <td className={`text-sm text-white`}>{coinData.current_price ? `$${addCommaToNumberString(coinData.current_price.toFixed(2))}` : "-"}</td>
                            </tr>

                            <tr>
                                <td className="text-md text-white">Current Price:</td>
                                <td className={`text-sm text-white`}>{coinData.current_price ? `$${addCommaToNumberString(coinData.current_price.toFixed(2))}` : "-"}</td>
                                </tr>
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
          </div>
        </Dialog>
      </Transition>
    )
}
