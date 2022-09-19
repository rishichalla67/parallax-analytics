export const Position = (symbol, quantity, type) => {
  return {
    symbol: symbol,
    quantity: parseFloat(quantity),
    type: type,
  };
};
