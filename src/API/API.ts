export { default } from './GeoIP2.js';

export declare class APIError extends Error {
  constructor(message: string);
}

export type Response = {
  success: boolean;
};

export type ResponseError = Response & {
  success: false;
  error: string;
  message: string;
};
