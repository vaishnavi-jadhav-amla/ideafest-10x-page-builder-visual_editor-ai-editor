/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { DirectionsRenderer, GoogleMap, MarkerF, LoadScript, Libraries } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import LoaderComponent from "../common/loader-component/LoaderComponent";
import { STORE_LOCATOR } from "@znode/constants/store-locator";
import { useToast } from "../../stores/toast";
import { useTranslations } from "next-intl";
import { errorStack, logServer, AREA } from "@znode/logger/server";
import { ILocation, IStoreList, IStoreLocator } from "@znode/types/store-locator";

interface IMapParams {
  plotOnMap?: IStoreList[];
  modeOfTravel: google.maps.TravelMode | string;
  SearchWithIn: string;
  userCurrentLocation: ILocation;
  availableStoreLocation?: IStoreLocator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
  setPlotOnMap: (arg1: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
  setFilteredStoreLocation: (arg1: any) => void;
  isFormSubmitted: boolean;
  isInvalidData?: boolean;
  defaultLocation?: { lat: number; lng: number };
  clearMapOnReset?: boolean;
  googleMapKey: string;
}

export function Map(props: IMapParams) {
  const {
    plotOnMap,
    modeOfTravel,
    SearchWithIn,
    userCurrentLocation,
    availableStoreLocation,
    setFilteredStoreLocation,
    setPlotOnMap,
    isFormSubmitted,
    isInvalidData,
    clearMapOnReset,
    googleMapKey,
  } = props;
  const [isMapLoaded, setMapLoaded] = useState(false);
  const storeLocatorTranslations = useTranslations("StoreLocator");
  const { error } = useToast();
  const mapRef = useRef<any>();

  const onLoad = () => {
    setMapLoaded(true);
  };

  const [directions, setDirections] = useState<any>();
  const [markerPosition, setMarkerPosition] = useState({
    lat: STORE_LOCATOR.DEFAULT_LATITUDE,
    lng: STORE_LOCATOR.DEFAULT_LONGITUDE,
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance * 0.621371;
  };

  const fetchNearByStores = () => {
    if (!availableStoreLocation || (availableStoreLocation && availableStoreLocation?.stores && availableStoreLocation?.stores.length == 0)) {
      return;
    }

    const locationsInRadius = availableStoreLocation?.stores?.filter((location: IStoreList) => {
      const distance = calculateDistance(userCurrentLocation?.lat, userCurrentLocation?.lng, location.latitude || 0, location.longitude || 0);
      return distance <= Number(SearchWithIn);
    });
    if (locationsInRadius && locationsInRadius.length > 0) {
      setFilteredStoreLocation(locationsInRadius);
      setPlotOnMap(locationsInRadius);
    } else {
      error(storeLocatorTranslations("noStoreFound"));
    }
  };

  const getDirections = (store: IStoreList, shouldUseDefaultLocation: boolean) => {
    const directionsService = new window.google.maps.DirectionsService();
    const originLocation = { lat: userCurrentLocation?.lat, lng: userCurrentLocation?.lng };
    return directionsService.route({
      origin: new window.google.maps.LatLng(originLocation?.lat, originLocation?.lng),
      destination: new window.google.maps.LatLng(store?.latitude || 0, store?.longitude || 0),
      travelMode: shouldUseDefaultLocation ? google.maps.TravelMode.DRIVING : (modeOfTravel as google.maps.TravelMode),
    });
  };

  const callDirectionsAPI = async (store: IStoreList) => {
    try {
      const data: any = await getDirections(store, false);

      if (data?.status === window.google.maps.DirectionsStatus.OK) {
        const responseData = data;
        responseData.custom = store;
        return responseData;
      }
    } catch (err) {
      const data: any = await getDirections(store, true);
      if (data?.status === window.google.maps.DirectionsStatus.OK) {
        const responseData = data;
        responseData.custom = store;
        return responseData;
      }
    }
  };

  const metersToMiles = (meters: number) => {
    return meters ? meters * 0.000621371 : 0;
  };

  useEffect(() => {
    setDirections([]);
  }, [clearMapOnReset]);

  const onLoadOfDirections = () => {
    const bounds = new window.google.maps.LatLngBounds();

    directions &&
      directions.forEach((marker: any) => {
        if (marker?.custom) {
          const latitudeAndLongitude = { lat: marker.custom.latitude, lng: marker.custom.longitude };
          bounds?.extend(latitudeAndLongitude);
        }
      });
    if (isMapLoaded && mapRef && mapRef?.current) {
      mapRef.current.state.map.fitBounds(bounds);
      mapRef.current.state.map.setCenter(userCurrentLocation);
      mapRef.current.state.map.setZoom(15);
    }
  };

  const loadDirections = async () => {
    setDirections([]);
    if (!plotOnMap || (plotOnMap && plotOnMap.length == 0)) {
      return;
    }

    const promises = plotOnMap.map((location) => callDirectionsAPI(location));

    const responses = [];
    const errors = [];

    for (const promise of promises) {
      try {
        const response = await promise;
        if (response && response.error) {
          errors.push(response);
        } else {
          responses.push(response);
        }
      } catch (err) {
        logServer.error(AREA.GOOGLE_MAP, errorStack(error));
      }
    }

    const locationsInRadius = responses.filter((val) => {
      const distanceValue = (val?.routes && val.routes[0] && val.routes[0]?.legs[0]?.distance?.value) || 0;
      if (distanceValue && metersToMiles(distanceValue) <= Number(SearchWithIn)) {
        return val;
      }
    });
    if (locationsInRadius && locationsInRadius.length > 0) {
      const filteredStore = locationsInRadius.map((val) => {
        return val?.custom;
      });
      setFilteredStoreLocation(filteredStore || []);
      setDirections(locationsInRadius);
    } else {
      setFilteredStoreLocation([]);
    }
  };

  useEffect(() => {
    if (userCurrentLocation) {
      const { lat, lng } = userCurrentLocation;
      setMarkerPosition({ lat: Number(lat || userCurrentLocation?.lat), lng: Number(lng || userCurrentLocation?.lng) });
    }
  }, [userCurrentLocation]);

  const mapStyles = {
    height: "75%",
  };

  useEffect(() => {
    if (isFormSubmitted) {
      plotOnMap && markerPosition && userCurrentLocation && !isInvalidData && loadDirections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotOnMap, markerPosition, userCurrentLocation, modeOfTravel, isInvalidData, SearchWithIn]);

  useEffect(() => {
    fetchNearByStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    isInvalidData && setDirections([]);
  }, [isInvalidData]);

  useEffect(() => {
    plotOnMap && setMarkerPosition({ lat: Number(plotOnMap[0]?.latitude), lng: Number(plotOnMap[0]?.longitude) });
  }, [plotOnMap]);

  const goldStar = {
    path: "M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z",
    fillColor: "#cc0008",
    fillOpacity: 0.8,
    scale: 0.1,
    strokeColor: "red",
    strokeWeight: 3,
  };

  const renderMarkers = (direction: any, index?: number) => {
    return (
      <div key={index}>
        <MarkerF position={direction?.request?.origin?.location} icon={"https://maps.google.com/mapfiles/ms/icons/green-dot.png"} />

        <MarkerF icon={goldStar} animation={window.google.maps.Animation.BOUNCE} position={direction?.request?.destination?.location} title={direction?.custom?.StoreName} />
      </div>
    );
  };

  const libraries: Libraries = ["places"];

  return (
    <div className="w-full h-full">
      <LoadScript googleMapsApiKey={googleMapKey || ""} libraries={libraries} onLoad={onLoad} loadingElement={<LoaderComponent isLoading={true} width="50px" height="50px" />}>
        {isMapLoaded && (
          <GoogleMap mapContainerClassName="h-full w-full" center={userCurrentLocation} zoom={STORE_LOCATOR.GOOGLE_MAP_ZOOM_LEVEL} mapContainerStyle={mapStyles} ref={mapRef}>
            {isMapLoaded && (!directions || (directions && directions.length == 0)) && (
              <MarkerF
                position={userCurrentLocation ? userCurrentLocation : { lat: STORE_LOCATOR.DEFAULT_LATITUDE || 42.79089, lng: STORE_LOCATOR.DEFAULT_LONGITUDE || -74.202984 }}
              />
            )}
            {isMapLoaded &&
              directions &&
              directions.length > 0 &&
              directions.map((storeDirection: google.maps.DirectionsResult, index: number) => renderMarkers(storeDirection, index))}
            {isMapLoaded &&
              directions &&
              directions.length > 0 &&
              directions.map((storeDirection: google.maps.DirectionsResult, index: number) => (
                <DirectionsRenderer onLoad={onLoadOfDirections} options={{ suppressMarkers: true }} key={index} directions={storeDirection} />
              ))}
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
}
