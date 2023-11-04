import Logger from './Logger.js';

import GeoIP2 from '@maxmind/geoip2-node';
import path from 'path';

// TODO: Read these from /config.json
const databasesPath = '/var/lib/GeoIP/';
const databases = {
  ASN: 'GeoLite2-ASN.mmdb',
  City: 'GeoLite2-City.mmdb',
  Country: 'GeoLite2-Country.mmdb',
};

enum DatabaseTypes {
  ASN = 'ASN',
  City = 'City',
  Country = 'Country',
}

function openDatabase(type: DatabaseTypes) {
  const databasePath = path.join(databasesPath, databases[type]);

  const database = GeoIP2.Reader.open(databasePath, {
    /* TODO: Figure out cache options. */
  });

  return database;
}

function getCountry(ipAddr: string) {
  return openDatabase(DatabaseTypes.Country)
    .then((reader) => {
      const country = reader.country(ipAddr).country;
      if (!country) {
        throw new GeoIP2.AddressNotFoundError('Unknown address.');
      }

      return country.isoCode;
    })
    .catch((reason) => {
      if (reason instanceof GeoIP2.AddressNotFoundError) {
        Logger.warn('getCountry got unknown address.');
        throw reason;
      } else if (reason instanceof GeoIP2.ValueError) {
        Logger.error('getCountry got bad address.');
        throw reason;
      } else if (reason instanceof GeoIP2.InvalidDbBufferError) {
        Logger.error('getCountry used wrong database.');
        throw reason;
      } else {
        throw new Error('Unknown Error', { cause: 'Unhandled Exception' });
      }
    });
}

const AddressNotFoundError = GeoIP2.AddressNotFoundError;
const InvalidDbBufferError = GeoIP2.InvalidDbBufferError;
const ValueError = GeoIP2.ValueError;

export default { getCountry, AddressNotFoundError, InvalidDbBufferError, ValueError };
