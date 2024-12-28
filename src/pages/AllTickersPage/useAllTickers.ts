import {  useEffect, useReducer, useState } from "react";
import { Ticker } from "../../domain-models";
import { requestFetchAllTickers } from "../../network";
import { calculateInitialStocks } from "./calculateInitialStocks";

interface State {
  isLoading: boolean;
  data: Ticker[];
  filters: {
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
    pageSize?: number;
  };
  count: number;
  nextURL?: string | null;
  error: unknown;
}

type Action =
  | {
      type: "FETCH_ALL_START";
    }
  | {
      type: "FETCH_ALL_SUCCESS";
      data: Ticker[];
      count: number;
      nextURL?: string | null;
    }
  | {
      type: "FETCH_ALL_ERROR";
      error: unknown;
    }
  | ({
      type: "CHANGE_FILTERS";
    } & State["filters"]);

type ActionHandlers = {
  [key in Action["type"]]: (
    state: State,
    action: Extract<Action, { type: key }>
  ) => State;
};

const initialState: State = {
  isLoading: false,
  data: [],
  filters: {
    pageSize: calculateInitialStocks() || 10,
  },
  count: 0,
  nextURL: null,
  error: null,
};

const actionHandlers: ActionHandlers = {
  FETCH_ALL_START: (state, _action) => ({
    ...state,
    isLoading: true,
    data: [],
    error: null,
  }),
  FETCH_ALL_SUCCESS: (state, { data, count, nextURL }) => ({
    ...state,
    isLoading: false,
    data: [...state.data, ...data], // Append new data for infinite scrolling
    count,
    nextURL,
  }),
  FETCH_ALL_ERROR: (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }),
  CHANGE_FILTERS: (state, { type, ...filters }) => ({
    ...state,
    isLoading: true,
    data: [], // Reset data when filters change
    filters: {
      ...state.filters,
      ...filters,
    },
  }),
};

function reducer(state: State = initialState, action: Action): State {
  return actionHandlers[action.type]?.(state, action as any) || state;
}

const useAllTickers = () => {
  const [{ isLoading, data, error, filters, nextURL }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const [loadMoreTrigger, setLoadMoreTrigger] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: "FETCH_ALL_START" });

    requestFetchAllTickers({
      search: filters.searchText,
      type: filters.type,
      market: filters.market,
      exchange: filters.exchange || "XNAS",
      cusip: filters.cusip,
      cik: filters.cik,
      date: filters.date,
      active: filters.active,
      order: filters.order,
      sort: filters.sort,
      limit: filters.pageSize,
      nextURL: nextURL ?? undefined,
      options: {
        signal: controller.signal,
      },
    })
      .then(({ data, count, nextURL }) => {
        dispatch({
          type: "FETCH_ALL_SUCCESS",
          data,
          count,
          nextURL,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return false;
        }
        dispatch({ type: "FETCH_ALL_ERROR", error });
      });
    return () => {
      controller.abort();
    };
  }, [filters, loadMoreTrigger]);

  const changeFilters = (filters: State["filters"]) =>
    dispatch({ type: "CHANGE_FILTERS", ...filters } as Action);

  const loadMore = () => setLoadMoreTrigger({});

  return {
    isLoadingAllTickers: isLoading,
    allTickers: data,
    loadingAllTickersError: error,
    allTickersFilters: filters,
    hasNextPage: !!nextURL,
    changeAllTickersFilters: changeFilters,
    loadMoreTickers: loadMore,
  };
};

export { useAllTickers };
