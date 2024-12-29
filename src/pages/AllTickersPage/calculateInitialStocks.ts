export const calculateInitialStocks = (columnCount: number) => {
  if (typeof window === "undefined") return 24; // Default for server-side rendering

  const viewportHeight = window.innerHeight;
  const headerHeight = 80; // Approximate height of the header
  const rowHeight = 100; // Approximate height of each row
  const width = window.innerWidth;

  if (width >= 1280) columnCount = 8;
  else if (width >= 1024) columnCount = 6;
  else if (width >= 768) columnCount = 4;
  else if (width >= 640) columnCount = 3;

  return Math.ceil((viewportHeight - headerHeight) / rowHeight) * columnCount;
};
