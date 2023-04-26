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
        <div className="flex items-center justify-center mb-4">
          <span>Sort positions by:</span>
          <div className="flex items-center ml-4">
            <button
              className={`${
                sortDescending ? "bg-red-600" : "bg-gray-200"
              } inline-flex items-center justify-center h-6 w-6 rounded-full`}
              onClick={() => setSortDescending(true)}
            >
              <ArrowDownIcon className="w-4 h-4 text-black" />
            </button>
            <span className="mx-2 text-gray-400">Desc</span>
            <button
              className={`${
                sortDescending ? "bg-gray-200" : "bg-green-600"
              } inline-flex items-center justify-center h-6 w-6 rounded-full`}
              onClick={() => setSortDescending(false)}
            >
              <ArrowUpIcon className="w-4 h-4 text-black" />
            </button>
            <span className="mx-2 text-gray-400">Asc</span>
          </div>
        </div>
        <div className="flex-grow"></div>
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
