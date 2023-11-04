import { Response, ResponseError } from './API.js';
import GeoIP2 from '../utils/GeoIP2.js';

export type ResponseASN = Response & {
  asn: string;
};
export type ResponseCity = Response & {
  city: string;
};
export type ResponseCountry = Response & {
  country: string;
};

async function getCountry(ipAddr: string): Promise<ResponseCountry | ResponseError> {
  return await GeoIP2.getCountry(ipAddr)
    .then((country) => {
      return { success: true, country: country };
    })
    .catch((reason) => {
      if (
        reason instanceof GeoIP2.AddressNotFoundError ||
        reason instanceof GeoIP2.InvalidDbBufferError ||
        reason instanceof GeoIP2.ValueError
      ) {
        return { success: false, error: reason.name, message: reason.message };
      }
      return { success: false, error: 'Unknown Error', message: 'Unhandled exception.' };
    });
}

async function allowedCountry(ipAddr: string, countries: string | string[] | undefined) {
  const country = await getCountry(ipAddr);
  if (!country.success) {
    return country;
  } else if ((Array.isArray(countries) && countries.includes(country.country)) || countries === country.country) {
    return country;
  } else {
    return { success: false, error: 'Country Blocked', message: `Country '${country.country}' is not allowed.` };
  }
}

export default { getCountry, allowedCountry };
