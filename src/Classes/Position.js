export const Position = (symbol, quantity, type, avgCost) => {
  return {
    symbol: symbol,
    quantity: parseFloat(quantity),
    type: type,
    valueHistory: [],
    avgCost: avgCost
  };
};
