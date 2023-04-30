import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  XIcon,
} from "@heroicons/react/solid";

function PortfolioSettings({ sortedPositions, setShowSettingsModal }) {
  const [sortDescending, setSortDescending] = useState(
    sortedPositions[0].value < sortedPositions[1].value
  );
  const positionOptions = ["Crypto", "Quantity", "Value"];
  const analyticsOptions = [
    "Position 24Hr Δ",
    "Symbol",
    "Position PnL",
    "Current Price",
    "Average Price",
  ];

  const handleSaveSettings = () => {
    // Save the selected settings and close the modal
    const newSortedPositions = sortedPositions.slice();
    if (sortDescending) {
      newSortedPositions.reverse();
    }
    // Call a function to save the new sorted positions
    // ...
    setShowSettingsModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-indigo-900 rounded-lg shadow-lg p-6 w-[70dvh] flex flex-col">
        <h2 className="text-lg font-medium mb-4">Portfolio Settings</h2>

        <div className="mb-6">
          <h3 className="text-base font-semibold underline mb-2">Positions</h3>
          <div className="flex flex-col space-y-2">
            <label htmlFor="positionSortColumn" className="font-medium ">
              Choose Default Column to Sort
            </label>
            <select
              id="positionSortColumn"
              className="rounded border-gray-300 bg-black shadow-sm"
            >
              {positionOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label htmlFor="positionSortDirection" className="font-medium">
              Choose Default Sort Direction
            </label>
            <select
              id="positionSortDirection"
              className="rounded border-gray-300 bg-black shadow-sm"
            >
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-semibold underline mb-2">Analytics</h3>
          <div className="flex flex-col space-y-2">
            <label htmlFor="analyticsSortColumn" className="font-medium">
              Choose Default Column to Sort
            </label>
            <select
              id="analyticsSortColumn"
              className="rounded border-gray-300 bg-black shadow-sm"
            >
              {analyticsOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <label htmlFor="analyticsSortDirection" className="font-medium">
              Choose Default Sort Direction
            </label>
            <select
              id="analyticsSortDirection"
              className="rounded border-gray-300 bg-black shadow-sm"
            >
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={() => setShowSettingsModal(false)}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={handleSaveSettings}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default PortfolioSettings;
