import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useCryptoOracle } from "../contexts/CryptoContext";


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

      <div className="inline-block mt-32  align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-slate-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl leading-6 font-medium text-white mb-4">
              <u><b>{coinData.name}</b></u>
            </h3>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col items-center justify-center text-white">
              <img src={coinData.image} alt={coinData.name} className="w-20 h-20 rounded-full" />
              <p className="text-sm text-white mt-2">Last updated: {new Date(coinData.last_updated).toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium text-white">Current Price: ${coinData.current_price.toFixed(2)}</p>
              <p className="text-sm text-white">Market Cap: ${coinData.market_cap.toLocaleString()}</p>
              <p className="text-sm text-white">Market Cap Rank: #{coinData.market_cap_rank}</p>
              <p className="text-sm text-white">Fully Diluted Valuation: ${coinData.fully_diluted_valuation}</p>
              <p className="text-sm text-white">Total Volume: ${coinData.total_volume.toLocaleString()}</p>
              <p className="text-sm text-white">24 Hour High: ${coinData.high_24h.toFixed(2)}</p>
              <p className="text-sm text-white">24 Hour Low: ${coinData.low_24h.toFixed(2)}</p>
              <p className={`text-sm ${coinData.price_change_percentage_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                24 Hour Price Change: {coinData.price_change_percentage_24h.toFixed(2)}%
              </p>
              <p className={`text-sm ${coinData.market_cap_change_percentage_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                24 Hour Market Cap Change: {coinData.market_cap_change_percentage_24h.toFixed(2)}
                </p>

                </div>
              </div>
              {/* <div className="px-4 py-3 sm:flex sm:items-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div> */}
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
}
