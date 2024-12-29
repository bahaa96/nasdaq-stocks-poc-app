import { observable, action, computed, makeAutoObservable } from "mobx";

interface TickerData {
  ticker: string;
  bid: string;
  ask: string;
  open: string;
  low: string;
  high: string;
  changes: number;
  date: string;
}

class TickersDataStore {
  data: TickerData[] = [];

  constructor() {
    makeAutoObservable(this, {
      data: observable,
      addNewTicker: action,
      tickers: computed,
    });
  }

  addNewTicker(newTicker: TickerData) {
    const newTickers = [...this.data];
    const targetIndex = newTickers.findIndex(
      (item) => item.ticker === newTicker.ticker,
    );

    if (targetIndex === -1) {
      newTickers.push(newTicker);
    } else {
      newTickers[targetIndex] = newTicker;
    }

    this.data = newTickers;
  }

  get tickers() {
    return this.data;
  }
}

export type { TickerData };

export default TickersDataStore;
