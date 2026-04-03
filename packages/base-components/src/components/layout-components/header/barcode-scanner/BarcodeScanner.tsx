import Button from "../../../common/button/Button";
import LoaderComponent from "../../../common/loader-component/LoaderComponent";
import { Modal } from "../../../common/modal/Modal";
import { Tooltip } from "../../../common/tooltip";
import { ZIcons } from "../../../common/icons";
import dynamic from "next/dynamic";
import { useModal } from "../../../../stores/modal";
import { useTranslations } from "next-intl";

const DynamicZXingBarcode = dynamic(() => import("./ZXingBarcode"), {
  loading: () => (
    <div className="w-[70vw] h-[40vh] sm:w-[70vw] sm:h-[60vh] md:w-[55vw] md:h-[55vh] lg:w-[45vw] lg:h-[60vh] p-5 flex align-center justify-center">
      <LoaderComponent isLoading={true} width="24px" height="24px" />
    </div>
  ),
  ssr: false,
});

export function BarcodeScanner({ dataTestSelector = "" }: { dataTestSelector?: string }) {
  const { openModal, closeModal } = useModal();

  const barcodeMessage = useTranslations("Barcode");

  const handleModalOpen = () => {
    openModal("BarcodeModal");
  };

  const handleModalClose = () => {
    closeModal();
  };

  return (
    <>
      <Tooltip message={barcodeMessage("barcodeScan")}>
        <Button
          type="text"
          size="small"
          dataTestSelector={`btn${dataTestSelector}ScanIcon`}
          startIcon={<ZIcons name="scan-barcode" color="#757575" height={"22px"} width={"22px"} data-test-selector={`svg${dataTestSelector}ScanIcon`} />}
          onClick={handleModalOpen}
          className="sm:ml-2 xs:p-1.5 xs:pl-0 sm:pl-1.5"
          ariaLabel="scan icon"
        />
      </Tooltip>
      <Modal size="7xl" modalId="BarcodeModal" maxHeight="xl" customClass=" overflow-y-auto ">
        <DynamicZXingBarcode onCloseModal={handleModalClose} />
      </Modal>
    </>
  );
}
