import { useAllTickers } from "./useAllTickers";

const AllTickersPage = () => {
  const { isLoadingAllTickers, allTickers, loadingAllTickersError } =
    useAllTickers();

  return (
    <div>
      <h1>All Tickers Page</h1>
      {isLoadingAllTickers ? (
        <div>Loading...</div>
      ) : (
        <div>
          {allTickers.map((ticker) => (
            <div key={ticker.name}>
              {ticker.name}
              {ticker.ticker}
            </div>
          ))}
        </div>
      )}
      {loadingAllTickersError && (
        <div>Error: {loadingAllTickersError.message}</div>
      )}
    </div>
  );
};
export default AllTickersPage;
