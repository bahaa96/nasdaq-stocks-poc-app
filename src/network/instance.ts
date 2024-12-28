import axios from "axios";
import config from "../config";

const CACHE_DURATION = 1000 * 5; // 5 seconds

const setCache = (key: string, data: any) => {
  const cacheData = {
    data,
    expiry: Date.now() + CACHE_DURATION,
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
};

const getCache = (key: string) => {
  const cacheData = localStorage.getItem(key);
  if (!cacheData) return null;

  const { data, expiry } = JSON.parse(cacheData);
  if (Date.now() > expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
};

const instance = axios.create({
  baseURL: config.APIURL,
  params: {
    apiKey: config.APIKey,
  },
});

instance.interceptors.request.use((request) => {
  const cacheKey = `${request.method}:${request.url}`;
  const cachedResponse = getCache(cacheKey);
  if (cachedResponse !== null) {
    request.adapter = () => {
      return Promise.resolve({
        data: cachedResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: request,
        request,
      });
    };
  }
  return request;
});

instance.interceptors.response.use((response) => {
  const cacheKey = `${response.config.method}:${response.config.url}`;
  setCache(cacheKey, response.data);
  return response;
});

export default instance;
