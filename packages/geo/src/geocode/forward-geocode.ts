import axios from "axios";
import { getMapboxToken } from "../config/get-mapbox-token";

/**
 * Forward geocode an address.
 * @param city The city of the address.
 * @param country The country of the address.
 * @param address The address to geocode.
 * @returns The latitude and longitude of the address.
 */
const forwardGeocode = async ({
  city,
  country,
  address,
}: {
  city: string;
  country: string;
  address: string | null;
}): Promise<{ latitude: number; longitude: number }> => {
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", `${address}, ${city}, ${country}`);
  url.searchParams.set("access_token", getMapboxToken());

  const { data } = await axios.get<{
    features: {
      properties: {
        coordinates: { latitude: number; longitude: number };
      };
    }[];
  }>(url.toString());

  if (data.features.length === 0) throw new Error("Location not found");

  return {
    latitude: data.features[0]!.properties.coordinates.latitude,
    longitude: data.features[0]!.properties.coordinates.longitude,
  };
};

export { forwardGeocode };
