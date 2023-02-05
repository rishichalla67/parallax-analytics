import React, { useState, useEffect } from "react";
import { useCryptoOracle } from "../../contexts/CryptoContext";
import { useFirestore } from "../../contexts/FirestoreContext";
import { addCommaToNumberString } from "./CryptoPortfolio";


export function calculatePnl(data) {
  if (data[0].value) {
    return (
      ((data[data.length - 1].value - data[0].value) /
        data[data.length - 1].value) *
      100
    ).toFixed(2);
  }
  //   console.log(data);
}

export function Analyics(privacyFilter) {
  const {
    nomicsTickers,
    portfolioValueHistory,
    filterDataByDateRange,
    portfolioPositions,
  } = useCryptoOracle();
  const {
    tickerList,
  } = useFirestore();

  //   console.log(filterDataByDateRange(portfolioValueHistory, "1D"));

  const [pnl1D, setPnl1D] = useState("");
  const [pnl1W, setPnl1W] = useState("");
  const [pnl1M, setPnl1M] = useState("");
  const [pnl1Y, setPnl1Y] = useState("");


  function calculatePositionPnl(position){
    let positionPnl = "Need Avg Price"
    if(position.avgCost === ""){
      return positionPnl
    }
    let initialInvestment = position.avgCost*position.quantity
    positionPnl = (((nomicsTickers[position.symbol].usd - position.avgCost)*position.quantity)-initialInvestment).toFixed(2)    
    positionPnl = "$"+positionPnl
    return positionPnl;
  }

  function calculatePositionPnlPercentage(position){
    let positionPnl = "Need Avg Price"
    if(position.avgCost === ""){
      return positionPnl
    }
    let initialInvestment = position.avgCost*position.quantity
    positionPnl = ((((nomicsTickers[position.symbol].usd - position.avgCost)*position.quantity)/initialInvestment)*100).toFixed(2)
    positionPnl = positionPnl+"%"
    
    return positionPnl;
  }

  useEffect(() => {
    let dayFilterRange = filterDataByDateRange(portfolioValueHistory, "24HR", false);
    let weekFilterRange = filterDataByDateRange(portfolioValueHistory, "1W", false);
    let monthFilterRange = filterDataByDateRange(portfolioValueHistory, "1M", false);
    let yearFilterRange = filterDataByDateRange(portfolioValueHistory, "1Y", false);

    setPnl1D(calculatePnl(dayFilterRange));
    setPnl1W(calculatePnl(weekFilterRange));
    setPnl1M(calculatePnl(monthFilterRange));
    setPnl1Y(calculatePnl(yearFilterRange));
  }, []);


  return (
    <div className="bg-gray-800  text-white p-2 md:px-12 md:py-12">
      <div className="flex flex-col sm:gap-4 text-sm">
        <div className="flex flex-col items-center">
          <table className="w-full text-[.65rem]">
            <thead>
              <tr className="text-[.7rem] sm:text-lg border-b">
                <th className="p-2 sm:p-3">Symbol</th>
                <th className="p-2">Current Price</th>
                <th className="p-2">Avg Price</th>
                <th className="p-2">Quantity</th>
                <th className="p-3 pl-6">PnL</th>
              </tr>
            </thead>
            <tbody>
              {portfolioPositions.map((position, index) => (
                <tr
                  className={`sm:text-lg ${
                    index === portfolioPositions.length - 1
                      ? ""
                      : "border-b border-dashed"
                  }`}
                  key={position.symbol}
                >
                  <td className="p-2">{tickerList[position.symbol]}</td>
                  <td className="p-2">${nomicsTickers[position.symbol].usd}</td>
                  <td className="p-2">${position.avgCost}</td>
                  <td className="p-2">{position.quantity.toFixed(2)}</td>
                  <td className={`sm:hidden p-2 text-right ${calculatePositionPnl(position).includes("-") ? 'text-red-500' : calculatePositionPnl(position) === "Need Avg Price" ? 'text-white text-[.7rem] leading-3' : 'text-green-500'}`}>
                    {calculatePositionPnlPercentage(position)} {addCommaToNumberString(calculatePositionPnl(position))}
                  </td>
                  <td className={`hidden sm:block p-2 text-right ${calculatePositionPnl(position).includes("-") ? 'text-red-500' : calculatePositionPnl(position) === "Need Avg Price" ? 'text-white text-[.7rem] leading-3' : 'text-green-500'}`}>
                    {calculatePositionPnlPercentage(position)} 
                  </td>
                  <td className={`sm:leading-2 hidden sm:block p-2 text-right ${calculatePositionPnl(position).includes("-") ? 'text-red-500' : calculatePositionPnl(position) === "Need Avg Price" ? 'text-white text-[.7rem] leading-3' : 'text-green-500'}`}>
                    {addCommaToNumberString(calculatePositionPnl(position))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
}
