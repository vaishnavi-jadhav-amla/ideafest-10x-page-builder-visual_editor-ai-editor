import Link from "next/link";
import { Modal } from "../common/modal";
import { ISignUpModal } from "../signup";
import { useTranslationMessages } from "@znode/utils/component";
import Button from "../common/button/Button";
import { useModal } from "../../stores";
import { Heading } from "../common/heading";

const ExistingUserError: React.FC<{ modalData: ISignUpModal }> = ({ modalData }) => {
  const registerMessages = useTranslationMessages("Register");
  const { closeModal } = useModal();
  const defaultStoreName = modalData?.errorDetails?.defaultStoreName || "";
  const forgotPasswordURL = modalData?.errorDetails?.forgotPasswordURL || "#";
  const existingUserNameError = registerMessages("existingUserNameError", { defaultStoreName });
  return (
    <>
      {modalData.showModal && (
        <Modal modalId="existingUserModal" customClass="overflow-y-auto w-full " size="2xl" maxHeight="xl">
          <div className="mx-1 ">
            <Heading
              name={registerMessages("existingUserImportantNote")}
              dataTestSelector="hdgExistingUserImportantNote"
              level="h3"
              customClass="uppercase bg-primaryColor xs:text-secondaryColor text-left pl-5"
            />
          </div>
          <div className="px-4 pt-3 mx-1 ">
            {existingUserNameError}
            <Link href={forgotPasswordURL} className=" text-linkColor">
              {registerMessages("existingUserForgotPasswordLink")}
            </Link>
            {registerMessages("existingUserForgotPasswordLinkEnd")}
          </div>
          <Button
            type="primary"
            size="small"
            className=" float-right mx-1 my-2 "
            onClick={() => {
              closeModal();
            }}
            dataTestSelector="btnCloseExistingUserModal"
          >
            Close
          </Button>
        </Modal>
      )}
    </>
  );
};

export default ExistingUserError;
