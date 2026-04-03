import { ILocation, IStoreList } from "@znode/types/store-locator";
import { AccordionItem } from "./AccordionItem";

interface IAccordionParams {
  title?: string;
  data?: IStoreList;
  modeOfTravel: google.maps.TravelMode | string;
  type?: string;
  responseData?: IStoreList;
  userCurrentLocation?: ILocation;
  googleMapKey?: string;
}

export function Accordion(props: IAccordionParams) {
  const { title, data, modeOfTravel, userCurrentLocation, googleMapKey } = props;
  return (
    <div className="accordion">
      <AccordionItem title={title} responseData={data} modeOfTravel={modeOfTravel} userCurrentLocation={userCurrentLocation} googleMapKey={googleMapKey}/>
    </div>
  );
}
