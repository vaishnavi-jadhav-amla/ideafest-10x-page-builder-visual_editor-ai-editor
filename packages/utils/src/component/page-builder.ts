/* eslint-disable no-console */

interface FetchWidgetsDataParams<D> {
  data: D;
  url: string;
}

export async function fetchWidgetsData<T extends { data: D }, D>(
  params: FetchWidgetsDataParams<D>
): Promise<D> {
  try {
    const response = await fetch(params.url);
    const responseData: T = await response.json();
    params.data = responseData.data;
  } catch (error) {
    console.log("Failed to fetch ", error, params.url);
  }

  return params.data;
}
