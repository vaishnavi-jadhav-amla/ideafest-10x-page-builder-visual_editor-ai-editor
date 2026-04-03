import React, { useRef, useState } from "react";

import Button from "../../../common/button/Button";
import { IOrderInvoiceData } from "@znode/types/account";
import { InvoiceTemplate } from "./InvoiceTemplate";
import { generateInvoiceDetails } from "../../../../http-request";
import jsPDF from "jspdf";
import { useToast } from "../../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

interface IGenerateInvoiceComponent {
  selectedOrders: string[];
}

const pdfFormat = {
  width: 827,
  height: 1169,
};
const GenerateInvoiceComponent = ({ selectedOrders }: IGenerateInvoiceComponent) => {
  const orderHistoryTranslation = useTranslationMessages("OrderHistory");
  const contentRef = useRef<HTMLDivElement>(null);
  const { error } = useToast();
  const [generateInvoiceData, setGenerateInvoiceData] = useState<IOrderInvoiceData[]>([]);
  const [show, setShow] = useState<boolean>(false);

  const handleGenerateInvoice = async () => {
    if (Array.isArray(selectedOrders) && selectedOrders.length > 0) {
      setShow(true);
      const invoiceData = await generateInvoiceDetails(selectedOrders.join(","));
      if (!invoiceData || invoiceData?.length === 0) {
        setShow(false);
        // error(invoiceData?.errorMessage);
        return;
      }

      setGenerateInvoiceData(invoiceData);
      setTimeout(() => {
        const pdf = new jsPDF({
          unit: "px",
          format: [pdfFormat.width, pdfFormat.height],
        });

        const generateInvoiceElement = contentRef.current;

        if (!generateInvoiceElement) {
          error("GenerateInvoice element not found.");
          return;
        }

        pdf.html(generateInvoiceElement, {
          callback: function (pdf) {
            const pdfName = `invoice_${Math.floor(Math.random() * 10 * 10000000)}.pdf`;
            pdf.save(pdfName);
            setShow(false);
          },
          x: 40,
          y: 40,
        });
      
      }, 500);
    } else {
      error("At least one order should be selected");
    }
  };

 

  return (
    <>
      <div className="text-right">
        <Button
          size="small"
          type="primary"
          ariaLabel="generate invoice button"
          dataTestSelector="btnGenerateInvoice"
          onClick={handleGenerateInvoice}
          disabled={selectedOrders?.length === 0}
          loading={show}
          showLoadingText={true}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
          loaderText={orderHistoryTranslation("generatingInvoice")}
          className="mt-2"
        >
          {orderHistoryTranslation("generateInvoice")}
        </Button>
      </div>
      {show && (
        <div className="relative hidden w-full">
          <div className="w-full absolute -left-[-1000px]">
            <div ref={contentRef} className="w-[747px] h-[1169px] visible">
              {generateInvoiceData?.length > 0 && <InvoiceTemplate orderData={generateInvoiceData} contentPageHeight={pdfFormat.height} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateInvoiceComponent;
