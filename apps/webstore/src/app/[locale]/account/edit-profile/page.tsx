import { NextIntlClientProvider } from "next-intl";
import { getResourceMessages } from "@znode/utils/server";
import { EditProfile } from "@znode/base-components/account/edit-profile";
export default async function EditProfilePage() {
  const editProfileMessages = await getResourceMessages("EditProfile");
  const commonMessages = await getResourceMessages("Common");
  const userPasswordMessages = await getResourceMessages("UserPassword");

  return (
    <NextIntlClientProvider messages={{ ...editProfileMessages, ...commonMessages, ...userPasswordMessages }}>
      <EditProfile />
    </NextIntlClientProvider>
  );
}
