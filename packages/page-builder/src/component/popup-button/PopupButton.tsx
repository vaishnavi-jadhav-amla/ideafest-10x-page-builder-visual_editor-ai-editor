"use client";

import React, { forwardRef, ReactNode, useState, useImperativeHandle, ForwardedRef, CSSProperties } from "react";
import { Popup } from "../popup/Popup";
import { ZIcons } from "@znode/base-components/common/icons";

export interface IPopupButtonRef {
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;

  // Confirm Popup
  openConfirmPopup?: () => void;
  closeConfirmPopup?: () => void;
  toggleConfirmPopup?: () => void;
}
interface IPopupButtonProps {
  buttonTitle: string;
  popupHeaderTitle: string;
  children: ReactNode;
  hasSaveButton?: boolean;
  saveButtonTitle?: string;
  hasSaveButtonHandle?: boolean; // parent component can handle save button functionality with close popup as well
  hasBackButtonHandle?: boolean; // parent component can handle back button functionality with close popup as well
  onSave: () => void;
  onBack: () => void;
  onOpen: (type?: "window" | "change", text?: string) => void;
  buttonStyleProps?: CSSProperties;

  popupConfirmHeaderTitle?: string;
  confirmPopupVisible?: boolean;
  confirmMessage?: string;
  onConfirmOk?: () => void;
  onConfirmCancel?: () => void;

  popupContainerStyle?: React.CSSProperties;
  confirmContainerStyle?: React.CSSProperties;
}

export const PopupButton = forwardRef(function PopupButton(props: IPopupButtonProps, ref: ForwardedRef<IPopupButtonRef>) {
  const {
    buttonTitle,
    popupHeaderTitle,
    children,
    onSave,
    onBack,
    onOpen,
    hasSaveButton = true,
    saveButtonTitle = "Apply Edits",
    hasSaveButtonHandle = false,
    buttonStyleProps = {},
    hasBackButtonHandle = false,

    popupConfirmHeaderTitle = "",
    confirmMessage,
    onConfirmOk = () => {},
    onConfirmCancel = () => {},
    popupContainerStyle,
  } = props;
  const [show, setShow] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  useImperativeHandle(ref, () => ({
    openPopup: handleOpenPopup,
    closePopup: handleClosePopup,
    togglePopup: handleTogglePopUp,

    // Confirm Popup
    openConfirmPopup: handleOpenConfirmPopup,
    closeConfirmPopup: handleCloseConfirmPopup,
    toggleConfirmPopup: handleToggleConfirmPopUp,
  }));

  function handleOpenPopup() {
    setShow(true);
  }

  function handleClosePopup() {
    setShow(false);
  }

  function handleTogglePopUp() {
    setShow((e) => !e);
  }

  function handleOpenConfirmPopup() {
    setOpenConfirm(true);
  }

  function handleCloseConfirmPopup() {
    setOpenConfirm(false);
  }

  function handleToggleConfirmPopUp() {
    setOpenConfirm((e) => !e);
  }

  function handleButton(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (e.detail === 0) return; // click ignored because it was triggered by Enter key

    e.preventDefault();
    handleTogglePopUp();
    onOpen();
  }

  function handleSave() {
    if (!hasSaveButtonHandle) {
      handleTogglePopUp();
    }
    onSave();
  }

  function handleClose() {
    if (!hasBackButtonHandle) {
      handleTogglePopUp();
    }
    onBack();
  }

  function renderFooter() {
    return (
      <div className="flex-1 flex items-center justify-end gap-2 py-2">
        <button className="flex items-center uppercase text-white rounded-sm px-3 py-1.5 text-sm font-medium" onClick={handleClose}>
          <ZIcons name="move-left" className="mr-1" color="#fff" data-test-selector="svgModalClose" /> Back
        </button>
        {hasSaveButton && (
          <button className="bg-greenBtnBg uppercase text-white rounded-sm px-3 py-1.5 hover:bg-greenBtnHoverBg transition text-sm font-medium" onClick={handleSave}>
            {saveButtonTitle}
          </button>
        )}
      </div>
    );
  }

  function renderConfirmFooter() {
    return (
      <div className="flex-1 flex items-center justify-end gap-2 py-2">
        <button className="flex items-center uppercase text-white rounded-sm px-3 py-1.5 text-sm font-medium" onClick={onConfirmOk}>
          <ZIcons name="move-left" className="mr-1" color="#fff" data-test-selector="svgModalClose" /> Back
        </button>
        {hasSaveButton && (
          <button className="bg-greenBtnBg uppercase text-white rounded-sm px-3 py-1.5 hover:bg-greenBtnHoverBg transition text-sm font-medium" onClick={onConfirmCancel}>
            Stay Here
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleButton}
        className="flex gap-2 justify-center items-center text-[#0158ad] w-full font-[500] rounded-sm py-2 px-4 border hover:bg-blue-200 transition"
        style={buttonStyleProps}
      >
        {buttonTitle}
      </button>
      {show && (
        <Popup containerStyle={popupContainerStyle} headerTitle={popupHeaderTitle} closePopup={handleClose} footerElement={renderFooter()}>
          {children}
        </Popup>
      )}

      {openConfirm && (
        <Popup headerTitle={popupConfirmHeaderTitle} closePopup={handleCloseConfirmPopup} footerElement={renderConfirmFooter()}>
          <p>{confirmMessage}</p>
        </Popup>
      )}
    </>
  );
});
