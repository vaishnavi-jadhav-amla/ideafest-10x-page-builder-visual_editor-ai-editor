/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { ILocation, ISearchParams, IStoreList, IStoreLocator } from "@znode/types/store-locator";
import LoaderComponent from "../common/loader-component/LoaderComponent";
import { useTranslations } from "next-intl";
import "./storeLocation.css";
import { Accordion } from "./Accordion";
import { Separator } from "../common/separator";

interface IStoreLocation {
  searchParams?: ISearchParams;
  modeOfTravel: google.maps.TravelMode | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
  setPlotOnMap: (arg1: any) => void;
  availableStoreLocation?: IStoreLocator;
  userCurrentLocation: ILocation;
  isLoading: boolean;
  googleMapKey: string;
}

export function StoreLocation(prop: IStoreLocation) {
  const storeLocatorTranslations = useTranslations("StoreLocator");
  const { modeOfTravel, availableStoreLocation, userCurrentLocation, isLoading, googleMapKey } = prop;
  const [filteredStoreLocation, setFilteredStoreLocation] = useState<IStoreLocator>();

  useEffect(() => {
    availableStoreLocation && setFilteredStoreLocation(availableStoreLocation);
  }, [availableStoreLocation]);

  const renderStoreLocation = () => {
    const currentLocationArray: any = filteredStoreLocation?.stores ? filteredStoreLocation?.stores : filteredStoreLocation;
    if (currentLocationArray && !currentLocationArray.length) {
      return <div className="flex justify-center gap border p-5">{storeLocatorTranslations("errorNoStoreFound")}</div>;
    }
    const storeLocationList =
      currentLocationArray &&
      currentLocationArray.map((val: IStoreList, index: number) => (
        <>
          <div className="flex gap-2 flex-col p-2" key={`${val?.storeName}_${index}`}>
            <div className="font-semibold">{val?.storeName}</div>
            <div>
              {val?.address1}, <span>{val?.cityName}</span>, <span>{val?.stateName}</span>, <span>{val?.postalCode}</span>
            </div>
            <Accordion title={storeLocatorTranslations("mapAndDirections")} data={val} modeOfTravel={modeOfTravel} userCurrentLocation={userCurrentLocation} googleMapKey={googleMapKey}/>
            <div className={"flex gap-1"}>
              <strong className="font-semibold">{storeLocatorTranslations("phoneNumber")}:</strong>
              <span>{val?.phoneNumber}</span>
            </div>
          </div>
          {currentLocationArray.length - 1 !== index ? <Separator customClass="my-0" /> : null}
        </>
      ));
    return storeLocationList;
  };

  return (
    <div>
      {
        <div className="flex flex-col gap-2 max-h-80 overflow-auto custom-scroll" tabIndex={0}>
          {filteredStoreLocation && !isLoading ? (
            renderStoreLocation()
          ) : (
            <div>
              <LoaderComponent isLoading={true} width="50px" height="50px" />
            </div>
          )}
        </div>
      }
    </div>
  );
}
