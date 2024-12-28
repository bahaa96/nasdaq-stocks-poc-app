export interface Ticker {
  active: boolean;
  cik: string;
  composite_figi: string;
  currency_name: string; // TODO: make this use a list of currency names
  last_updated_utc: string;
  locale: string; //TODO: make this use a list of locales
  market: string;
  name: string;
  primary_exchange: string;
  share_class_figi: string;
  ticker: string;
  type: string;
}
