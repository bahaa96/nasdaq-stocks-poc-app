export const calculateInitialStocks = () => {
  const viewportHeight = window.innerHeight;
  const headerHeight = 80; // Approximate height of the header
  const rowHeight = 100; // Approximate height of each row
  return Math.ceil((viewportHeight - headerHeight) / rowHeight) * 4; // 4 columns per row
};
