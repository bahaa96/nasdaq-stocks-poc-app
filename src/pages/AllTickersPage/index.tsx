import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { useInView } from "react-intersection-observer";

import { StockTicker } from "@/domain-models";
import useVirtualList from "./useVirtualList";
import { calculateInitialStocks } from "./calculateInitialStocks";

const NasdaqLogo = () => (
  <div className="text-white font-bold text-xl">NASDAQ</div>
);

const StockCard = ({ stock }: { stock: StockTicker }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-start justify-center h-full">
    <span className="text-lg font-medium text-white">{stock.ticker}</span>
    <span className="text-sm text-gray-400 truncate w-full" title={stock.name}>
      {stock.name}
    </span>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-start justify-center h-full animate-pulse">
    <div className="w-16 h-6 bg-gray-700 rounded mb-2"></div>
    <div className="w-full h-4 bg-gray-700 rounded"></div>
  </div>
);

const AllTickersPage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const {
    parentRef,
    rowVirtualizer,
    stocks,
    loadMoreItems,
    hasNextPage,
    isFetching,
    error,
    columnCount,
    changeFilters,
    isRateLimited,
  } = useVirtualList({ searchQuery: debouncedSearch });

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      loadMoreItems();
    }
  }, [inView, loadMoreItems]);

  useEffect(() => {
    changeFilters({ searchText: debouncedSearch });
  }, [debouncedSearch, changeFilters]);

  const renderSkeletonCards = () => {
    const skeletonCount = calculateInitialStocks(columnCount);
    return (
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4`}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={parentRef}
      className="min-h-screen bg-black text-white overflow-auto w-full"
    >
      <div className="w-full px-4">
        <div className="bg-black">
          <div className="flex items-center gap-4 mb-6 bg-gray-900 rounded-b-lg p-4">
            <NasdaqLogo />
            <Input
              type="search"
              placeholder="Search"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 flex-grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="relative">
          {isFetching && stocks.length === 0  && (
            <div className="absolute inset-0">{renderSkeletonCards()}</div>
          )}
          {!isFetching && stocks.length === 0 ? (
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
                const rowIndex = virtualRow.index * columnCount;
                const rowStocks = stocks.slice(
                  rowIndex,
                  rowIndex + columnCount
                );

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
                    <div
                      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4`}
                    >
                      {rowStocks.map((stock, index) => (
                        <StockCard key={stock.ticker} stock={stock} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div ref={loadMoreRef} className="mt-4 pb-8 text-center">
          {isFetching && !isRateLimited && stocks.length !==0 && (
            <p className="text-gray-400">Loading more stocks...</p>
          )}
          {!hasNextPage && !search && stocks.length > 0 && (
            <div className="flex flex-col items-center">
              <p className="text-gray-400">No more stocks to load</p>
            </div>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AllTickersPage;
