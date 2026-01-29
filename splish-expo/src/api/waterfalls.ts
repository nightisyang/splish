import { getApiUrl, getImageUrl } from '../config';
import type { WaterfallSummary, WaterfallDetails, MalaysianState } from '../types/waterfall';

export async function fetchWaterfallsByState(state: MalaysianState): Promise<WaterfallSummary[]> {
  const response = await fetch(getApiUrl(`/api/v1/waterfalls/?state=${state}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch waterfalls: ${response.status}`);
  }

  const json = await response.json();

  return json.data.waterfalls.map((val: any) => ({
    id: val._id,
    name: val.name,
    summary: val.summary,
    imgFilenameArr: val.imgDetails.imgFullResFilename.map((filename: string) => ({
      uri: getImageUrl(filename),
    })),
  }));
}

export async function fetchWaterfallDetails(
  waterfallId: string,
  userLatLng?: string
): Promise<{ waterfall: WaterfallDetails; distance: number | null }> {
  const url = userLatLng
    ? getApiUrl(`/api/v1/waterfalls/${waterfallId}/${userLatLng}`)
    : getApiUrl(`/api/v1/waterfalls/${waterfallId}/`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch waterfall details: ${response.status}`);
  }

  const json = await response.json();
  const val = json.data.waterfall;

  return {
    waterfall: {
      name: val.name,
      description: val.description,
      state: val.state,
      coordinate: val.location.coordinates,
      waterSource: val.waterSource,
      waterfallProfile: val.waterfallProfile,
      accessibility: val.accessibility,
      lastUpdate: val.lastUpdate,
      difficulty: val.difficulty,
      imgFilenameArr: val.imgDetails.imgFullResFilename.map((filename: string) => ({
        uri: getImageUrl(filename),
      })),
    },
    distance: json.data.distance ?? null,
  };
}
