import config from "../config";
import { StockTicker } from "../domain-models";
import instance from "./instance";

interface RequestFetchAllTickersArgs {
  ticker?: string;
  type?: string;
  market?: string;
  exchange?: string;
  cusip?: string;
  cik?: string;
  date?: string;
  search?: string;
  active?: boolean;
  order?: "asc" | "desc";
  limit?: number;
  sort?: string;
  nextURL?: string;
  options?: {
    signal?: AbortSignal;
  };
}

interface RequestFetchAllTickersResponse {
  count: number;
  next_url: string;
  request_id: string;
  results: StockTicker[];
  status: string;
  error?: string;
}

interface RequestFetchAllTickersResult {
  data: StockTicker[];
  count: number;
  nextURL: string | null;
}

const requestFetchAllTickers = async ({
  ticker,
  type,
  market,
  exchange,
  cusip,
  cik,
  date,
  search,
  active,
  order,
  limit,
  sort,
  nextURL,
  options,
}: RequestFetchAllTickersArgs): Promise<RequestFetchAllTickersResult> => {
  const {
    data: { results, count, next_url, error },
  } = await instance.get<RequestFetchAllTickersResponse>(
    nextURL ? nextURL.replace(config.APIURL, "") : "/reference/tickers",
    {
      params: {
        ticker,
        type,
        market,
        exchange,
        cusip,
        cik,
        date,
        search,
        active,
        order,
        limit,
        sort,
      },
      signal: options?.signal,
    }
  );

  if (error) {
    throw new Error(error);
  }

  return { data: results, count, nextURL: next_url };
};

export { requestFetchAllTickers };
