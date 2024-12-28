import axios from "axios";
import config from "../config";

const instance = axios.create({
  baseURL: config.APIURL,
  params: {
    apiKey: config.APIKey,
  },
});

export default instance;
