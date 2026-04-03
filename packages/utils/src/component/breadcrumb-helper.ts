import { IClientBreadCrumbsData } from "@znode/types/breadcrumb";

export function breadCrumbPathFinder(inputPath: string | undefined) {
  if (inputPath) {
    const pathMap = new Map<string, string>([
      ["return-order", "/return-order"],
      ["return-receipt", "/return-order"],
      ["return-receipt-flag", "/return-order-details"],
      ["manage-return", "/return-order"],
      ["manage-return-flag", "/edit-return-order"],
      ["quote-detail-flag", "/quote-order-details"],
      ["order-account-flag", "/account-orders"],
      ["pending-orders-payment-flag", "/pending-payment-history"],
      ["order", "/order/list"],
      ["order-flag", "/account-orders"],
      ["quote", "/quote/list"],
      ["voucher", "/voucher/list"],
      ["pending-order", "/pending-order/list"],
      ["address-book", "/address-book"],
      ["edit-template", "/order-templates"],
      ["order-templates", "/order-templates/list"],
      ["saved-cart", "/saved-cart/list"],
      ["pending-payment", "/pending-payment/list"],
    ]);
    return pathMap.get(inputPath) || inputPath;
  }
  return inputPath;
}

export function getCustomPath(searchParams: URLSearchParams, nextUrl: string): IClientBreadCrumbsData {
  // List of query params which affects path's url if matched
  const pathSearchParamsList: string[] = ["returnAccount"];

  // List of query params which affects nested's path url if matched
  const nestedPathSearchParamsList: string[] = ["OmsTemplateId", "addressId", "IsPendingPayment"];

  const parts = nextUrl.split("/");

  const index = parts.indexOf("account");

  // gets first breadcrumb element name
  let path = index !== -1 && parts.length > index + 1 ? parts[index + 1] : "";

  // gets second breadcrumb element name
  let nestedPath: string | boolean | undefined = false;
  if (index !== -1 && parts.length > index + 2 && parts[index + 2] !== "list" && parts[index + 2] !== "payment-history") {
    nestedPath = parts[index + 1] + "-" + parts[index + 2];
  }

  // checks for change in first and second breadcrumb element according to query params
  const nestedPathFlag = nestedPathSearchParamsList.some((flagName) => searchParams.has(flagName));
  if (nestedPathFlag) nestedPath = nestedPath + "-flag";
  const pathFlag = pathSearchParamsList.some((flagName) => searchParams.has(flagName));
  if (pathFlag) path = path + "-flag";

  return {
    routingPath: "/", //base routing
    routingLabel: "home", //base heading
    nestedRouting: nestedPath, //first element's flag
    nestedRoutingPath: "/account" + breadCrumbPathFinder(path), //first element's route
    title: path, //first element's heading
    nestedRoutingTitle: nestedPath ? nestedPath : "", //second element's heading
    nestedRoutingLabel: path,
  };
}
