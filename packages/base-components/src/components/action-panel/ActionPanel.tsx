"use client";

import Button from "../common/button/Button";
import { EmailAFriend } from "../email-a-friend/EmailAFriend";
import { Modal } from "../common/modal/Modal";
import { ZIcons } from "../common/icons";
import { useModal } from "../../stores/modal";
import { useRouter } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";

const ActionPanel = ({ categoryName, productName, categoryId }: { categoryName: string; productName: string; categoryId: number }) => {
  const commonTranslations = useTranslationMessages("Common");
  const router = useRouter();
  const { openModal } = useModal();
  const handleEmailAFriendClick = () => {
    openModal("EmailAFriend");
    document.body.classList.add("overflow-hidden");
  };

  return (
    <div className={"no-print heading-4 py-0"}>
      <Button
        type="text"
        size="small"
        className="text-zinc-400 mr-4"
        onClick={() => {
          window.print();
        }}
        dataTestSelector="btnPrint"
        startIcon={<ZIcons name="printer" color="#a1a1aa" data-test-selector="svgPrint" />}
        ariaLabel={commonTranslations("print")}
      >
        {commonTranslations("print")}
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => router.push(`/category/${categoryId}`)}
        className="text-zinc-400 mr-4"
        dataTestSelector="btnSeeMore"
        startIcon={<ZIcons name="circle-plus" color="#a1a1aa" width="23px" data-test-selector="svgSeeMore" />}
        ariaLabel={`${commonTranslations("seeMore")} ${categoryName}`}
      >
        {commonTranslations("seeMore")} {categoryName}
      </Button>
      <Button
        type="text"
        size="small"
        className="text-zinc-400 mr-4"
        onClick={handleEmailAFriendClick}
        ariaLabel={commonTranslations("emailAFriend")}
        dataTestSelector="btnEmailAFriend"
        startIcon={<ZIcons name="mail" color="#a1a1aa" width="23px" data-test-selector="svgEmailAFriend" />}
      >
        {commonTranslations("emailAFriend")}
      </Button>
      <Modal modalId="EmailAFriend" size="4xl">
        <EmailAFriend productName={productName} />
      </Modal>
    </div>
  );
};

export default ActionPanel;
