import { GEO_INFO_STATUSES, GeoLocationInfo, GeoProviderAdapter } from '../lib/interfaces';
import { LocalStorageAdapter } from '../valueStorage/localStorageAdapter';

export class IPApiProvider implements GeoProviderAdapter {
  static key: string | null;
  static siteId: string | number | null;

  get url(): string {
    const fields = 'status,country,countryCode,regionName,region,city,timezone,mobile';
    return IPApiProvider.key
      ? `https://ip-location.hellobar.com/json?key=${IPApiProvider.key}&fields=${fields}`
      : `http://ip-api.com/json?fields=${fields}`;
  }

  async getLocationInfo() {
    let json: GeoLocationInfo;

    try {
      const localStorage: any = new LocalStorageAdapter();
      const storageKey = `hb_ip_info_${IPApiProvider.siteId}`
      const value = JSON.parse(localStorage.getValue(storageKey))

      if (value && (new Date(value.expiration) > new Date())) {
        json = value.ip_info
      } else {
        localStorage.removeValue(storageKey);
        const response = await fetch(this.url);
        json = await response.json();
        const expiry_date = new Date(new Date().setDate(new Date().getDate() + 30));
        await localStorage.setValue(storageKey, { "ip_info": json, "expiration": expiry_date })
      }
    } catch (err) {
      json = { status: GEO_INFO_STATUSES.fail } as GeoLocationInfo;
    }

    return json;
  }
}
