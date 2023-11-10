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
import { evaluate, exp } from "mathjs";

export default function UpdatePosition({
  selectedPosition,
  setShowModal,
  setSuccessMessage,
}) {
  const [disable, setDisable] = useState(true);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(true);
  const [quantity, setQuantity] = useState(null);
  const updateQuantityRef = useRef();
  const updateTypeRef = useRef();
  const updateAvgCostRef = useRef();
  const cancelButtonRef = useRef(null);

  const {
    nomicsTickers,
    refreshOraclePrices,
    portfolioValue,
    setPortfolioValue,
    portfolioPositions,
  } = useCryptoOracle();
  const { activeUser, removePositionFromFirebase, tickerList, updatePosition } =
    useFirestore();

  const isValidExpression = (expression) => {
    try {
      evaluate(expression);
      return true;
    } catch {
      return false;
    }
  };

  const cleanInput = (input) => {
    return input.replace(/,/g, "").replace(/\n/g, " ").replace(/\. /g, ".");
  };

  const splitInput = (input) => {
    return input.split(/\s+/);
  };

  const evaluateExpression = (expression) => {
    return evaluate(expression);
  };

  function checkToDisable(e) {
    const cleanedInput = cleanInput(e.target.value.trim());
    const inputs = splitInput(cleanedInput);
    let total = 0;
    for (const input of inputs) {
      if (isValidExpression(input)) {
        total += evaluateExpression(input);
        setQuantity(total);
      }
    }
    if (
      updateQuantityRef.current.value === "" &&
      updateTypeRef.current.value === "" &&
      updateAvgCostRef.current.value === ""
    ) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }

  async function updateSelectedPosition(e) {
    e.preventDefault();
    await updatePosition(
      selectedPosition,
      Position(
        selectedPosition.symbol,
        updateQuantityRef.current.value === ""
          ? selectedPosition.quantity
          : quantity === null
          ? updateQuantityRef.current.value
          : quantity,
        updateTypeRef.current.value === ""
          ? selectedPosition.type
          : updateTypeRef.current.value,
        updateAvgCostRef.current.value === ""
          ? selectedPosition.avgCost
          : parseFloat(updateAvgCostRef.current.value)
      ),
      activeUser.portfolioID
    );

    setShowModal(false);
    setChecked(false);
    setDisable(true);
    refreshOraclePrices();
  }

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

  return (
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
                <form className={`h-full p-4 md:mt-8 mx-8`} action="#">
                  <div className="text-white rounded-md shadow-sm -space-y-px">
                    <h3 className="flex justify-center text-2xl font-bold text-sky-400">{`Update ${
                      tickerList[selectedPosition.symbol]
                        .charAt(0)
                        .toUpperCase() +
                      tickerList[selectedPosition.symbol].slice(1)
                    } Position Details`}</h3>
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
                        type="text"
                        inputMode="decimal"
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
                    <div className="pt-2">
                      <h3 className="flex align-content-left font-semibold">
                        Average Cost
                      </h3>
                      <label htmlFor="avgCost" className="sr-only">
                        Average Cost
                      </label>
                      <input
                        id="avgCost"
                        name="avgCost"
                        type="text"
                        inputMode="decimal"
                        onChange={checkToDisable}
                        ref={updateAvgCostRef}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={selectedPosition.avgCost}
                      />
                    </div>
                    <div>
                      <label className="flex justify-center text-white text-sm font-medium py-4 px-4 rounded ">
                        <input
                          type="checkbox"
                          className="rounded w-4 h-4 hover:cursor-pointer"
                          defaultChecked={checked}
                          onChange={() => {
                            setChecked(!checked);
                          }}
                        />
                        <a className={`pl-2 leading-3 `}>
                          I understand that once the position is deleted, there
                          is no way to revert
                        </a>
                      </label>
                    </div>
                    <div className={`flex justify-center pt-4 min-h-90% `}>
                      <button
                        type="delete"
                        onClick={() => {
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
                        Delete
                      </button>
                    </div>
                    <div className="flex justify-center space-x-5 py-4 px-2 min-h-90%">
                      <div className="pt-2 pb-2">
                        <button
                          type="submit"
                          onClick={(e) => {
                            updateSelectedPosition(e);
                          }}
                          className={`${
                            disable
                              ? "bg-sky-700 opacity-40"
                              : "bg-sky-500 hover:bg-sky-300"
                          } text-black font-bold py-2 px-4 rounded`}
                          disabled={disable}
                        >
                          Update
                        </button>
                      </div>
                      <div className="pt-2 pb-2">
                        <button
                          className="bg-slate-500 hover:bg-slate-300 text-black font-bold py-2 px-4 rounded"
                          onClick={() => {
                            setShowModal(false);
                            setChecked(false);
                            setDisable(true);
                          }}
                        >
                          Close
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
  );
}
