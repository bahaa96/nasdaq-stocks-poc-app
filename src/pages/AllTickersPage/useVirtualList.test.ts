import { renderHook, act } from "@testing-library/react-hooks";
import { jest } from '@jest/globals';
import useVirtualList from "./useVirtualList";
import { useInfiniteQuery } from "@tanstack/react-query";
import { requestFetchAllTickers } from "@/network";

jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock("@/network", () => ({
  requestFetchAllTickers: jest.fn(),
}));

describe("useVirtualList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      status: "idle",
      error: null,
    });

    const { result } = renderHook(() => useVirtualList());

    expect(result.current.stocks).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isRateLimited).toBe(false);
  });

  it("should fetch next page when loadMoreItems is called", async () => {
    const fetchNextPage = jest.fn();
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      fetchNextPage,
      hasNextPage: true,
      isFetching: false,
      isFetchingNextPage: false,
      status: "idle",
      error: null,
    });

    const { result } = renderHook(() => useVirtualList());

    await act(async () => {
      result.current.loadMoreItems();
    });

    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("should handle rate limit error", async () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetching: false,
      isFetchingNextPage: false,
      status: "idle",
      error: null,
    });

    (requestFetchAllTickers as jest.Mock).mockRejectedValue({
      response: { status: 429 },
    } as never);

    const { result, waitForNextUpdate } = renderHook(() => useVirtualList());

    await act(async () => {
      result.current.loadMoreItems();
    });

    await waitForNextUpdate();

    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.error).toBe("Rate limit exceeded. Please try again later.");
  });

  it("should update filters when changeFilters is called", () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      status: "idle",
      error: null,
    });

    const { result } = renderHook(() => useVirtualList());

    act(() => {
      result.current.changeFilters({ searchText: "AAPL" });
    });

    expect(result.current.stocks).toEqual([]);
  });
});
