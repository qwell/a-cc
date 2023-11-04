import API from './API/API.js';
import Logger from './utils/Logger.js';

import express from 'express';

/*
 * TODO: generate certs for dev, QA, and prod
 * TODO: Pull port from config
 */
const PORT = 8080;

const app = express();
app.listen(PORT, () => {
  Logger.verbose(`a-cc listening on port ${PORT}`);
});

app.get('/countries/allowed/:ipAddr', (req, res) => {
  const { ipAddr } = req.params;
  const countries = req.query.countries as string | string[] | undefined;

  void API.allowedCountry(ipAddr, countries).then((country) => {
    res.json(country);
  });
});

app.get('/countries/:ipAddr', (req, res) => {
  const { ipAddr } = req.params;

  void API.getCountry(ipAddr).then((country) => {
    res.json(country);
  });
});

/* TODO: Tests
 *   - call GeoIP2 with incorrect method(s) for DB type
 */

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('GeoIP2 known-bad address', async () => {
    const ipAddr = 'This is words, not an IP address.';
    const country = await API.getCountry(ipAddr);
    expect(country.success).toBe(false);
  });
  it('GeoIP2 known-good address', async () => {
    const ipAddr = '13.34.66.46'; // Amazon AWS us-east-1, 13.34.66.0/27
    const country = await API.getCountry(ipAddr);

    expect(country.success).toBe(true);
    if (country.success) {
      // FIXME: Surely vitest has ways to handle type narrowing? This is silly.
      expect(country.country).toBe('US');
    }
  });
  it('GeoIP2 country allowed', async () => {
    const ipAddr = '13.34.66.46'; // Amazon AWS us-east-1, 13.34.66.0/27
    const country = await API.allowedCountry(ipAddr, ['US', 'DE', 'CA']);
    expect(country.success).toBe(true);
  });
  it('GeoIP2 country disallowed', async () => {
    const ipAddr = '13.34.66.46'; // Amazon AWS us-east-1, 13.34.66.0/27
    const country = await API.allowedCountry(ipAddr, ['FR', 'BE', 'NL']);
    expect(country.success).toBe(false);
  });
  it('GeoIP2 empty countries list', async () => {
    const ipAddr = '0.0.0.0';
    const country = await API.allowedCountry(ipAddr, []);
    expect(country.success).toBe(false);
  });
}
