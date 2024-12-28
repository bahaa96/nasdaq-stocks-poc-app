import { useAllTickers } from "./useAllTickers";

import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback } from "react";
import { calculateInitialStocks } from "./calculateInitialStocks";
import { useVirtualizer } from "@tanstack/react-virtual";

const NasdaqLogo = () => (
  <div className="text-white font-bold text-xl">NASDAQ</div>
);

const StockCard = ({ stock }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-start justify-center h-full">
    <span className="text-lg font-medium text-white">{stock.ticker}</span>
    <span className="text-sm text-gray-400 truncate w-full" title={stock.name}>
      {stock.name}
    </span>
  </div>
);

const AllTickersPage = () => {
  const {
    isLoadingAllTickers,
    allTickers,
    hasNextPage,
    loadingAllTickersError,
    changeAllTickersFilters,
    allTickersFilters,
    loadMoreTickers,
  } = useAllTickers();

  const [search, setSearch] = useState("");

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(allTickers.length / 4),
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 100, []),
    overscan: 5,
  });

  useEffect(() => {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
    if (!lastItem) {
      return;
    }
    if (
      lastItem.index >= Math.ceil(allTickers.length / 4) - 1 &&
      hasNextPage &&
      !isLoadingAllTickers
    ) {
      console.log("Load more tickers");

        loadMoreTickers();
    }
  }, [
    // rowVirtualizer.getVirtualItems(),
    allTickers.length,
    hasNextPage,
    // loadMoreTickers,
    isLoadingAllTickers,
  ]);

  const renderSkeletonCards = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: calculateInitialStocks() }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-start justify-center h-full animate-pulse"
          >
            <div className="w-16 h-6 bg-gray-700 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={parentRef}
      className="min-h-screen bg-black text-white overflow-auto"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-black">
          <div className="flex items-center gap-4 mb-6 bg-gray-900 rounded-b-lg p-4">
            <NasdaqLogo />
            <Input
              type="search"
              placeholder="Search"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="relative">
          <div
            className={`transition-opacity duration-300 ${
              isLoadingAllTickers && allTickers.length === 0
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            } absolute inset-0`}
          >
            {renderSkeletonCards()}
          </div>
          <div
            className={`transition-opacity duration-300 ${
              isLoadingAllTickers && allTickers.length === 0
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {allTickers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-lg">No stocks available</p>
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const rowIndex = virtualRow.index * 4;
                  const rowStocks = allTickers.slice(rowIndex, rowIndex + 4);

                  if (rowStocks.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {rowStocks.map((stock, index) => (
                          <StockCard key={index} stock={stock} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pb-8 text-center">
          {isLoadingAllTickers && allTickers.length !== 0 ? (
            <p className="text-gray-400">Loading more stocks...</p>
          ) : null}
          {!hasNextPage && !isLoadingAllTickers && allTickers.length > 0 ? (
            <p className="text-gray-400">No more stocks to load</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AllTickersPage;
