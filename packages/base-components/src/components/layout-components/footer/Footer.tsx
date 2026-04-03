import Copyright from "./copyright/Copyright";
import CustomerSupport from "./customer-support/CustomerSupport";
import HelpLink from "./help-link/HelpLink";
import SocialMedia from "./social-media/SocialMedia";
import StoreInfo from "./store-info/StoreInfo";
import { getPortalDetails } from "@znode/agents/portal/portal";

const getPortalData = async () => {
  const portalData = await getPortalDetails();
  return portalData;
};

export async function Footer() {
  const portalData = await getPortalData();
  const customerServiceNumber = portalData?.customerServicePhoneNumber;
  const cmsMappingId = portalData?.portalId;

  return (
      <footer className="bg-footerBgColor text-footerPrimaryTextColor no-print">
        <div className="px-8 py-5 m-4 text-center md:px-0 md:text-start">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-4">
            <div className="flex items-center justify-center md:justify-start md:items-start" data-test-selector="divHelpContainer">
              <HelpLink cmsMappingId={cmsMappingId} />
            </div>
            <div className="flex justify-center md:justify-start" data-test-selector="divStoreInfoContainer">
              <StoreInfo cmsMappingId={cmsMappingId} />
            </div>
            <div className="" data-test-selector="divCustomerSupportContainer">
              <CustomerSupport customerServiceNumber={customerServiceNumber} />
            </div>
            <div
              className="flex flex-col mx-auto md:mx-0 "
              data-test-selector="divFollowMaxwellsLifestyleContainer"
            >
              <SocialMedia cmsMappingId={cmsMappingId} />
            </div>
          </div>
        </div>
        <Copyright />
      </footer>
  );
}
