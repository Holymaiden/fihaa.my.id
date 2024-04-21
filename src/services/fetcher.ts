import axios, { type AxiosResponse } from 'axios';

export const fetcher = (url: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  axios.get(url).then((response: AxiosResponse) => response.data);
