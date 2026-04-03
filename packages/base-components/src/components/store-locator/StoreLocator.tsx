"use client";

import { GOOGLE_MAP, STORE_LOCATOR } from "@znode/constants/store-locator";
import { ILocation, ISearchLocation, ISearchLocationResponse, ISearchParams, IStoreList, IStoreLocator, IStoreLocatorResponse } from "@znode/types/store-locator";
import { useEffect, useState } from "react";

import { BreadCrumbs } from "../common/breadcrumb";
import Button from "../common/button/Button";
import { Dropdown } from "../common/dropdown";
import { HeadingBar } from "../common/heading-bar/HeadingBar";
import { Map } from "./Map";
import { StoreLocation } from "../store-location/StoreLocation";
import { ValidationMessage } from "../common/validation-message";
import { convertCamelCase } from "@znode/utils/server";
import { getStoreLocator } from "../../http-request/store-locator";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

export function StoreLocator({ googleMapKey, appName }: { googleMapKey: string; appName: string }) {
  const storeLocatorTranslations = useTranslations("StoreLocator");
  const [searchParams, setSearchParams] = useState<ISearchParams>();
  const [plotOnMap, setPlotOnMap] = useState<IStoreList[]>();
  const [modeOfTravel, setModeOfTravel] = useState<string>(STORE_LOCATOR?.DEFAULT_TRAVEL_MODE);
  const [searchWithIn, setSearchWithIn] = useState<string>(STORE_LOCATOR?.DEFAULT_SEARCH_WITHIN);
  const [userCurrentLocation, setUserCurrentLocation] = useState<ILocation>({
    lat: 0,
    lng: 0,
  });
  const [storeLocation, setStoreLocation] = useState<IStoreLocator>();
  const [filteredStoreLocation, setFilteredStoreLocation] = useState<IStoreLocator>();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [clearMap, setClearMap] = useState(false);
  const [isInvalidData, setIsInvalidData] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState({
    lat: STORE_LOCATOR.DEFAULT_LATITUDE,
    lng: STORE_LOCATOR.DEFAULT_LONGITUDE,
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<IStoreLocator>({ defaultValues: { postalCode: "", city: "", state: "" } });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ModeOfTravelOptions = [
    { text: storeLocatorTranslations("driving"), value: "DRIVING" },
    { text: storeLocatorTranslations("walking"), value: "WALKING" },
    { text: storeLocatorTranslations("transit"), value: "TRANSIT" },
    { text: storeLocatorTranslations("bicycling"), value: "BICYCLING" },
  ];

  const distance = [
    { text: storeLocatorTranslations("fiveMiles"), value: "5" },
    { text: storeLocatorTranslations("tenMiles"), value: "10" },
    { text: storeLocatorTranslations("twentyFiveMiles"), value: "25" },
    { text: storeLocatorTranslations("fiftyMiles"), value: "50" },
    { text: storeLocatorTranslations("seventyFiveMiles"), value: "75" },
    { text: storeLocatorTranslations("hundredMiles"), value: "100" },
  ];

  const getStoreLocation = async () => {
    const storeLocations: IStoreLocatorResponse = await getStoreLocator();
    if (storeLocations?.data?.stores?.length) {
      setStoreLocation(storeLocations.data);
      setDefaultLocation({
        lat: storeLocations.data.stores[0].latitude || STORE_LOCATOR.DEFAULT_LATITUDE,
        lng: storeLocations.data.stores[0].longitude || STORE_LOCATOR.DEFAULT_LONGITUDE,
      });
    } else {
      setStoreLocation([] as IStoreLocator);
    }
    getLocation();
  };

  const clearMapAndPastSearches = () => {
    reset();
    setClearMap(true);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserCurrentLocation({ lat: Number(latitude), lng: Number(longitude) });
      });
    }
  };

  useEffect(() => {
    getStoreLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    storeLocation && setFilteredStoreLocation(storeLocation);
  }, [storeLocation]);

  const searchForLocation = async (searchParams: ISearchParams) => {
    const addressToSearch = searchParams?.type === "CityAndState" ? `${searchParams?.city}, ${searchParams?.state}` : searchParams?.postalCode;
    const address = await fetch(`${GOOGLE_MAP.GEO_CODE_URL}?address=${addressToSearch}&key=${googleMapKey}`);
    const response = await address.json();
    return convertCamelCase(response as ISearchLocationResponse);
  };

  const filterSearchedStoreLocations = (searchParams: ISearchParams, response: ISearchLocation[]) => {
    if (storeLocation && storeLocation?.stores && storeLocation?.stores.length === 0) {
      return [];
    }
    const relatedAddressParams = response[0].addressComponents.map((val) => {
      return val?.shortName?.toLowerCase().trim();
    });
    const filteredArray: IStoreList[] = [];
    storeLocation?.stores?.forEach((store: IStoreList) => {
      const storeState = store.stateName?.toLowerCase().trim() || "";
      const storeCity = store.cityName?.toLowerCase().trim() || "";
      const storeName = store?.storeName?.replace(/[ ,]/g, "").toLowerCase() || "";
      const postalCode = store?.postalCode + "";
      const currentStoreDetails = [storeState, storeCity, storeName, postalCode];

      for (let i = 0; i <= currentStoreDetails.length; i++) {
        if (relatedAddressParams.includes(currentStoreDetails[i] + "")) {
          filteredArray.push(store);
          break;
        }
      }
    });

    return filteredArray;
  };

  const fetchNearByStores = (filteredData: IStoreList[]) => {
    if (!filteredData) {
      return;
    }
    setPlotOnMap(filteredData);
    setIsLoading(false);
  };

  const filterAddress = async (searchParams: ISearchParams) => {
    if (storeLocation && storeLocation?.stores) {
      const response: ISearchLocationResponse = await searchForLocation(searchParams);
      response.status !== STORE_LOCATOR.ZERO_RESULT &&
        setUserCurrentLocation({ lat: Number(response?.results[0].geometry.location.lat), lng: Number(response?.results[0]?.geometry.location?.lng) });
      if (response?.results && response?.results.length > 0 && !response?.results[0]?.partialMatch) {
        const filteredData = filterSearchedStoreLocations(searchParams, response?.results);
        if (filteredData && filteredData.length > 0) {
          setIsInvalidData(false);
          setUserCurrentLocation({ lat: Number(response?.results[0].geometry.location.lat), lng: Number(response?.results[0].geometry.location.lng) });
          fetchNearByStores(filteredData);
        } else {
          setFilteredStoreLocation([] as IStoreLocator);
          setIsInvalidData(true);
          setIsLoading(false);
        }
      } else {
        setFilteredStoreLocation([] as IStoreLocator);
        setIsInvalidData(true);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    searchParams && filterAddress(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSubmit = async (formData: IStoreLocator) => {
    setIsLoading(true);
    if (formData?.postalCode === "" && formData?.city === "" && formData?.state === "") {
      setIsLoading(false);
      setError("postalCode", { type: "postalCode", message: storeLocatorTranslations("postalCodeRequiredMessage") });
      setError("city", { type: "city", message: storeLocatorTranslations("cityRequiredMessage") });
      setError("state", { type: "state", message: storeLocatorTranslations("stateRequiredMessage") });
      return;
    } else if (formData?.postalCode === "" && formData?.city !== "" && formData?.state === "") {
      setIsLoading(false);
      setError("state", { type: "state", message: storeLocatorTranslations("stateRequiredMessage") });
      return;
    } else if (formData?.postalCode === "" && formData?.city === "" && formData?.state !== "") {
      setIsLoading(false);
      setError("city", { type: "city", message: storeLocatorTranslations("cityRequiredMessage") });
      return;
    }
    const validatedFormData =
      formData?.postalCode !== "" ? { postalCode: formData?.postalCode, type: "PostalCode" } : { state: formData?.state, city: formData.city, type: "CityAndState" };
    setSearchParams(validatedFormData);
    setIsFormSubmitted(true);
  };

  const breadCrumbsData = {
    title: storeLocatorTranslations("storeLocator"),
    routingLabel: "Home",
    routingPath: "/",
  };
  return (
    <div className="md:m-4 min-[992px]:m-0 lg:m-4 min-[1200px]:m-0">
      <BreadCrumbs customPath={breadCrumbsData} />
      <HeadingBar name={storeLocatorTranslations("findBranch")} />

      <div className="mt-2 max-[992px]:w-full md: p-0 flex gap-8 md:gap-16 md:px-8 md:pt-8 xs:flex-col md:flex-row">
        <div className="xs:w-full md:w-1/3 flex flex-col gap-5">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="pb-2">
              <div className="required pb-2">
                <label className="font-semibold" data-test-selector="lblPostalCode">
                  {storeLocatorTranslations("postalCode")}
                </label>
              </div>
              <input className="input  px-2 py-1 w-full h-10" {...register("postalCode")} placeholder="" aria-label="Postal Code" data-test-selector="txtPostalCode" />
              {errors?.postalCode && <ValidationMessage message={errors?.postalCode?.message || ""} dataTestSelector="postalCodeError" />}
            </div>
            <div className="flex items-center justify-center my-2">
              <hr className="w-10/12 my-3 border-gray-800" />
              <div className="text-gray-700 px-2 font-semibold">{storeLocatorTranslations("textOR")}</div>
              <hr className="w-10/12 my-3 border-gray-800" />
            </div>
            <div className="pb-2">
              <div className="required pb-2">
                <label className="font-semibold" data-test-selector="lblCity">
                  {storeLocatorTranslations("city")}
                </label>
              </div>
              <input className="input  px-2 py-1 w-full h-10" {...register("city")} placeholder="" aria-label="City" data-test-selector="txtCityField" />
              {errors?.city && <ValidationMessage message={errors?.city?.message || ""} dataTestSelector="cityError" />}
            </div>
            <div className="pb-2">
              <div className="required pb-2">
                <label className="font-semibold" data-test-selector="lblState">
                  {storeLocatorTranslations("State")}
                </label>
              </div>
              <input className="input  px-2 py-1 w-full h-10" {...register("state")} placeholder="" aria-label="State" data-test-selector="txtState" />
              {errors?.state && <ValidationMessage message={errors?.state?.message || ""} dataTestSelector="stateError" />}
            </div>
            <div className="pb-2 text-left mt-3 flex xs:flex-col lg:flex-row lg:justify-between lg:items-center">
              <Button
                htmlType="submit"
                type="primary"
                size="small"
                ariaLabel="submit store locator button"
                className="mt-2 xs:w-full lg:w-[48%]"
                dataTestSelector="btnSubmit"
                loading={isLoading}
                disabled={!storeLocation?.stores || !isDirty}
                showLoadingText={true}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
              >
                {storeLocatorTranslations("submit")}
              </Button>
              <Button
                type="secondary"
                size="small"
                ariaLabel="Reset store locator button"
                className="mt-2 xs:w-full lg:w-[48%]"
                dataTestSelector="btnCancel"
                onClick={() => {
                  setIsFormSubmitted(false);
                  clearMapAndPastSearches();
                  getStoreLocation();
                }}
              >
                {storeLocatorTranslations("reset")}
              </Button>
            </div>
          </form>
          {
            <StoreLocation
              isLoading={isLoading}
              searchParams={searchParams}
              setPlotOnMap={setPlotOnMap}
              modeOfTravel={modeOfTravel}
              userCurrentLocation={userCurrentLocation}
              availableStoreLocation={filteredStoreLocation}
              googleMapKey={googleMapKey}
            />
          }
        </div>
        <div className="md:w-3/4">
          <div className="flex gap-2 pb-5 justify-end w-full text-sm">
            <div className="flex items-baseline mx-2">
              <label className="font-semibold w-full">{storeLocatorTranslations("searchWithin")}:</label>
              <Dropdown
                options={distance}
                defaultValue={0}
                IsLocalizeNotEnabled={true}
                onSelect={(e: string) => {
                  setSearchWithIn(e);
                }}
              />
            </div>

            <div className="flex items-baseline">
              <label className="font-semibold w-full">{storeLocatorTranslations("modeOfTravel")}:</label>
              <Dropdown
                options={ModeOfTravelOptions}
                defaultValue={0}
                IsLocalizeNotEnabled={true}
                onSelect={(e: string) => {
                  setModeOfTravel(e);
                }}
              />
            </div>
          </div>
          <div className="flex-grow h-[500px] md:h-[550px] lg:h-[650px]">
            {appName === "PAGE_BUILDER" && !googleMapKey ? (
              <div className="font-semibold w-full h-full flex justify-center items-center">{storeLocatorTranslations("googleMapApiKeyConfigured")}</div>
            ) : (
              <Map
                plotOnMap={plotOnMap}
                setPlotOnMap={setPlotOnMap}
                modeOfTravel={modeOfTravel}
                userCurrentLocation={userCurrentLocation}
                SearchWithIn={searchWithIn}
                availableStoreLocation={storeLocation}
                setFilteredStoreLocation={setFilteredStoreLocation}
                isFormSubmitted={isFormSubmitted}
                isInvalidData={isInvalidData}
                defaultLocation={defaultLocation}
                clearMapOnReset={clearMap}
                googleMapKey={googleMapKey}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
