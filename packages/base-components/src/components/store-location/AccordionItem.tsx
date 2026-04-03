/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useTranslations } from "next-intl";
import { useToast } from "../../stores/toast";
import LoaderComponent from "../common/loader-component/LoaderComponent";
import { useEffect, useState } from "react";
import { ILocation, IStoreList } from "@znode/types/store-locator";
import { DirectionImage } from "./DirectionImage";
import { GOOGLE_MAP } from "@znode/constants/store-locator";

interface IAccordionParams {
  title?: string;
  data?: IStoreList;
  modeOfTravel: google.maps.TravelMode | string;
  type?: string;
  responseData?: IStoreList;
  userCurrentLocation?: ILocation;
  googleMapKey?: string;
}

interface IStoreCoordinationParams {
  instructions: string;
  maneuver: string;
  distance: { text: string };
}

export function AccordionItem(props: IAccordionParams) {
  const { error } = useToast();
  const storeLocatorTranslations = useTranslations("StoreLocator");
  const { title, responseData, modeOfTravel, userCurrentLocation, googleMapKey } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [storeDirection, setStoreDirection] = useState<any>();

  const getUserLocationAddress = async (lat: number, lng: number) => {
    const address = await fetch(`${GOOGLE_MAP.GEO_CODE_URL}?latlng=${lat},${lng}&key=${googleMapKey}`);
    return await address.json();
  };

  const getDirections = async (store: IStoreList, isDefaultLocation: boolean) => {
    const directionsService = new window.google.maps.DirectionsService();
    const originLocation = { lat: userCurrentLocation?.lat, lng: userCurrentLocation?.lng };
    return directionsService.route({
      origin: new window.google.maps.LatLng(Number(originLocation?.lat), Number(originLocation?.lng)),
      destination: new window.google.maps.LatLng(store?.latitude || 0, store?.longitude || 0),
      travelMode: isDefaultLocation ? google.maps.TravelMode.DRIVING : (modeOfTravel as google.maps.TravelMode),
    });
  };

  const getSelectedDirectionMode = (modeOfTravel: string) => {
    const availableMode: { [key: string]: string } = {
      DRIVING: "Driving",
      WALKING: "Walking",
      TRANSIT: "Transit",
      BICYCLING: "Bicycling",
    };
    const selectedMode = availableMode[modeOfTravel];
    const mode = storeLocatorTranslations(selectedMode);
    return mode.toLocaleLowerCase();
  };

  const callDirectionsAPI = async (store: IStoreList) => {
    const userAddress = await getUserLocationAddress(userCurrentLocation?.lat || 0, userCurrentLocation?.lng || 0);

    try {
      const data: any = await getDirections(store, false);
      if (data?.status === window.google.maps.DirectionsStatus.OK) {
        const responseData: { steps: string[]; custom: IStoreList } = {
          steps: [],
          custom: [] as IStoreList,
        };

        responseData.steps = data?.routes[0]?.legs[0];
        responseData.custom = store;

        return responseData;
      }
    } catch (err) {
      setIsOpen(false);
      error(
        `${storeLocatorTranslations("enableToCalculateTheLocationErrorMessage")} ${getSelectedDirectionMode(modeOfTravel)} ${storeLocatorTranslations("directionFrom")} ${userAddress?.results[0].formatted_address
        } ${storeLocatorTranslations("to")} ${responseData?.storeName || "-"}`
      );
    }
  };
  const createRouteInstructions = () => {
    if (!storeDirection && storeDirection?.steps?.steps && storeDirection?.steps?.steps.length == 0) {
      return <div>No route found</div>;
    }
    const arrayOfStep = storeDirection?.steps?.steps?.map((val: IStoreCoordinationParams, index: number) => {
      const imageValue = `${val?.maneuver && val.maneuver !== "" ? val?.maneuver : "straight"}`;
      return (
        <div className="border-b flex items-center gap-2 w-full" key={index}>
          <div className="w-20 flex flex-shrink-2 flex-row justify-center items-center">
            <span className="w-1/3">{index + 1}</span>
            <span className="w-2/3">{<DirectionImage name={imageValue} />}</span>
          </div>
          <div className="w-60" dangerouslySetInnerHTML={{ __html: val?.instructions }}></div>
          <span className="w-20">{val?.distance?.text || "-"}</span>
        </div>
      );
    });
    return arrayOfStep;
  };

  const getDirectionInstruction = async (val: IStoreList) => {
    const steps: any = await callDirectionsAPI(val);
    if (!steps || steps.length == 0) {
      return [];
    }
    setStoreDirection(steps);
  };

  const openDirectionPanel = () => {
    if (!userCurrentLocation || userCurrentLocation?.lat == 0) {
      error(storeLocatorTranslations("enableToSearchLocationWithOutSearchParams"));
      return;
    } else {
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    isOpen && getDirectionInstruction(responseData as IStoreList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div className="accordion-item w-full">
      <div className={`accordion-item-header cursor-pointer text-cyan-700 ${isOpen ? "open" : ""}`} onClick={() => openDirectionPanel()}>
        {title}
      </div>
      {isOpen && (
        <div className="accordion-item-content pt-4">
          {storeDirection && storeDirection?.steps && storeDirection?.custom?.storeLocationCode == responseData?.storeLocationCode ? (
            <div className="border rounded-cardBorderRadius">
              <div className="flex text-slate-500 p-5 border-b bg-slate-200 items-center">
                <img src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Map pointer" />
                <span>{storeDirection?.steps?.end_address || "-"}</span>
              </div>
              <div className="flex gap-2 text-slate-500 border-b px-5 py-2">
                <span>{storeDirection?.steps?.distance?.text}</span>
                About
                <span>{storeDirection?.steps?.duration?.text}</span>
              </div>
              <div className="flex flex-col gap-2 p-5">{createRouteInstructions()}</div>
            </div>
          ) : (
            <div>
              <LoaderComponent isLoading={true} width="25px" height="25px" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
