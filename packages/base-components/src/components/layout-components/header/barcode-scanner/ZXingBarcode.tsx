/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";

import { BrowserMultiFormatReader } from "@zxing/library";
import Button from "../../../common/button/Button";
import { ValidationMessage } from "../../../../components/common/validation-message";
import { getBarcodeProduct } from "../../../../http-request";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface IZXingBarcodeProps {
  onCloseModal: () => void;
}

export function ZXingBarcode({ onCloseModal }: Readonly<IZXingBarcodeProps>) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [noProductMessage, setNoProductMessage] = useState<string>("");

  const barcodeMessage = useTranslations("Barcode");
  const handleBarcodeResetEvent = () => {
    if (videoRef.current) {
      setNoProductMessage("");
      if (videoRef.current) {
        videoRef.current.play();
      }
      startScanning();
      resetTimeout();
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Set timeout again for 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (videoRef.current) videoRef.current?.pause();
      setNoProductMessage(barcodeMessage("invalidBarcode"));
      codeReader?.current?.stopContinuousDecode();
    }, 10000);
  };

  const startScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    codeReader.current = new BrowserMultiFormatReader();
    codeReader.current?.decodeFromVideoDevice(null, videoRef.current, async (result) => {
      if (result) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        codeReader?.current?.stopContinuousDecode();
        const decodedText = result.getText();
        const product = await getBarcodeProduct({ decodedText });
        const productList = product?.filteredProductData?.productList || [];
        if (productList.length > 0) {
          const firstProduct = productList[0];
          const seoUrl = firstProduct.seoUrl;
          const productId = firstProduct.znodeProductId;

          const url = seoUrl ? `/${seoUrl}` : `/product/${productId}`;
          onCloseModal();
          router.push(`${url}`);
        } else {
          if (videoRef.current) videoRef.current.pause();
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setNoProductMessage(barcodeMessage("noProductFound"));
        }
      }
    });
  };

  useEffect(() => {
    startScanning();
    resetTimeout();

    return () => {
      if (codeReader.current) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        codeReader.current.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (videoRef.current) videoRef.current.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`flex flex-col relative w-[70vw] h-[40vh] sm:w-[70vw] sm:h-[60vh] md:w-[55vw] md:h-[55vh] lg:w-[45vw] lg:h-[60vh] ${noProductMessage ? "m-4 mb-2" : "m-4"}`}>
      <video ref={videoRef} className="w-full h-[80%] sm:h-[90%] object-cover flex-1" />
      {noProductMessage && (
        <div className="flex items-center flex-col sm:flex-row justify-center sm:justify-between pt-2">
          <ValidationMessage customClass="text-errorColor" message={noProductMessage} dataTestSelector="noProductFound" />
          <Button type="primary" size="small" onClick={handleBarcodeResetEvent} className="h-8 px-4 my-2 sm:my-0" dataTestSelector="btnRetry" ariaLabel="Retry">
            {barcodeMessage("retry")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ZXingBarcode;
