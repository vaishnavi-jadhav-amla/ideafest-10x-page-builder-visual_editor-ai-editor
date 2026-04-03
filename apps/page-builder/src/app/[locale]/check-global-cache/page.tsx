import { getPortalHeader } from "@znode/utils/server";

const CheckGlobalCachePage = async () => {
  const portalHeaders = await getPortalHeader();

  return (
    <div>
      <h1>portal headers</h1>
      {portalHeaders ? JSON.stringify(portalHeaders) : "Please refresh again"}
    </div>
  );
};

export default CheckGlobalCachePage;
