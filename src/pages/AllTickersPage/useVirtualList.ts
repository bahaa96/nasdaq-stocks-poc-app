import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef, useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { requestFetchAllTickers } from "@/network";
import { calculateInitialStocks } from "./calculateInitialStocks";
import axios from "axios";

interface UseVirtualListProps {
  initialFilters?: {
    searchText?: string;
    type?: string;
    market?: string;
    exchange?: string;
    cusip?: string;
    cik?: string;
    date?: string;
    active?: boolean;
    order?: "asc" | "desc";
    sort?: string;
  };
  searchQuery?: string;
}

function useVirtualList({
  initialFilters = {},
  searchQuery = "",
}: UseVirtualListProps = {}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(2);
  const [filters, setFilters] = useState(initialFilters);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllers = useRef(new Map<string, AbortController>());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["tickers", filters, searchQuery],
    queryFn: async ({ pageParam = null }) => {
      const cacheKey = JSON.stringify({ filters, searchQuery, pageParam });
      if (abortControllers.current.has(cacheKey)) {
        abortControllers.current.get(cacheKey)!.abort();
      }

      const controller = new AbortController();
      abortControllers.current.set(cacheKey, controller);

      try {
        const result = await requestFetchAllTickers({
          ...filters,
          search: searchQuery,
          limit: calculateInitialStocks(columnCount),
          exchange: "XNAS",
          nextURL: pageParam,
          options: {
            signal: controller.signal,
          },
        });
        setIsRateLimited(false);
        setErrorMessage(null);
        abortControllers.current.delete(cacheKey);
        return result;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          setIsRateLimited(true);
          setErrorMessage("Rate limit exceeded. Please try again later.");
          throw new Error("Rate limit exceeded");
        }
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        abortControllers.current.delete(cacheKey);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextURL,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Disable retries
  });

  const allTickers = data ? data.pages.flatMap((page) => page.data) : [];

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(allTickers.length / columnCount),
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 100, []),
    overscan: 5,
    getItemKey: useCallback(
      (index) => allTickers[index * columnCount]?.ticker || index,
      [allTickers, columnCount]
    ),
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [allTickers.length, columnCount, rowVirtualizer]);

  const loadMoreItems = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRateLimited) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRateLimited]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setColumnCount(2);
      else if (width < 768) setColumnCount(3);
      else if (width < 1024) setColumnCount(4);
      else if (width < 1280) setColumnCount(6);
      else setColumnCount(8);
    };

    handleResize(); // Set initial column count
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const changeFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    parentRef,
    rowVirtualizer,
    stocks: allTickers,
    loadMoreItems,
    hasNextPage: hasNextPage && !isRateLimited,
    isLoading: status === "loading",
    isFetching,
    error: errorMessage,
    columnCount,
    changeFilters,
    isRateLimited,
  };
}

export default useVirtualList;
