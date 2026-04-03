"use client";

import React, { useState } from "react";

import { ZIcons } from "@znode/base-components/common/icons";

interface IMediaPopupProps {
  onChange: (_value: string) => void;
  mediaType: string;
  header: string;
  Component: React.ComponentType<{ mediaType: string; onChangeImage: (_value: string) => void }>;
  ButtonIcon?: React.ComponentType<any>;
}

export function MediaPopup(props: IMediaPopupProps) {
  const { ButtonIcon } = props;
  const [show, setShow] = useState(false);

  const handleClose = (selectedImage: string) => {
    props.onChange(selectedImage);
    setShow(false);
  };

  const handleClosePopUp = () => {
    setShow(false);
  };
  const handleTogglePopUp = () => {
    setShow((e) => !e);
  };

  const handleButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e.detail === 0) return; // click ignored because it was triggered by Enter key

    e.preventDefault();
    handleTogglePopUp();
  };

  const renderPopup = () => {
    const { Component, mediaType, header } = props;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-[1000]">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 border-b bg-modalHeaderBg">
            <h1 className="text-lg font-semibold text-white uppercase">{header}</h1>
            <button onClick={handleClosePopUp} data-test-selector="btnModalClose" className="flex items-center uppercase text-white rounded-sm py-1.5 text-sm font-medium">
              <ZIcons name="move-left" className="mr-1" color="#fff" data-test-selector="svgModalClose" />
              Back
            </button>
          </div>

          <div className="p-4">
            <div className="overflow-y-hidden">
              {" "}
              {/* Set a smaller height */}
              {/* Render the passed component dynamically */}
              <Component mediaType={mediaType} onChangeImage={handleClose} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button onClick={handleButton} className="flex gap-2 justify-center items-center text-[#0158ad] w-full font-[500] rounded-sm py-2 px-4 border hover:bg-blue-200 transition">
        {ButtonIcon && <ButtonIcon color="#0158ad" size={16} />} {props.header}
      </button>
      {show && renderPopup()}
    </>
  );
}
