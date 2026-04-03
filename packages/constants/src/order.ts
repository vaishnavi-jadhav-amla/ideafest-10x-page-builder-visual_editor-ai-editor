// Constants related to orders and quotes
const ORDER = {
  QUOTE_STATUS: "In Review",
  QUOTE_STATUS_CANCELED: "Canceled",
  QUOTE_STATUS_SUBMIT: "Submitted",
  QUOTE_STATUS_APPROVED: "Approved",
  QUOTE_STATUS_EXPIRED: "Expired",
  SUCCESS_PLACED_ORDER_FOR_APPROVAL: "SuccessPlacedOrderForApproval",
  ANNUAL_ORDER_LIMIT_FAILED: "AnnualOrderLimitFailed",
  ENABLE_USER_ORDER_ANNUAL_LIMIT: "EnableUserOrderAnnualLimit",
  ENABLE_USER_ORDER_LIMIT: "EnableUserOrderLimit",
  PER_ORDER_LIMIT_FAILED: "PerOrderLimitFailed",
  PENDING_APPROVAL: "PENDING APPROVAL",
  PENDING_PAYMENT: "PENDING PAYMENT",
  REJECTED: "REJECTED",
  APPROVED: "APPROVED",
  ENABLE_RETURN_REQUEST: "EnableReturnRequest",
  USER_ORDER_RECEIPT_ORDER_ID: "UserOrderReceiptOrderId",
  GUEST_USER_KEY: "GuestUserKey",
  SHOW_SHIPPING_CONSTRAINTS: "ShowShippingConstraints",
  DEFAULT_REASON_ID: "9",
  SHIP_COMPLETE: "ShipComplete",
  USER_PENDING_ORDER_RECEIPT_ORDER_ID: "UserPendingOrderReceiptOrderId",
};

const ORDER_DATA_TYPE = {
  QUOTE: "Quotes",
  ORDER: "Orders",
  ORDER_TEMPLATE: "OrderTemplates",
  CREATE_SAVE_FOR_LATER: "CreateSaveForLater",
  MOVE_TO_CART: "MoveToCart",
  CARTS: "Carts",
  SAVED_CARTS: "SavedCarts",
  SAVE_FOR_LATER: "SaveForLaters",
  APPROVAL_ROUTING: "ApprovalRoutings",
};

const TARGET_ORDER_DATA_TYPE = {
  QUOTE: "Quotes",
  ORDER: "Orders",
  ORDER_TEMPLATE: "OrderTemplates",
  CREATE_SAVE_FOR_LATER: "CreateSaveForLater",
  MOVE_TO_CART: "MoveToCart",
  CARTS: "Carts",
  SAVED_CARTS: "SavedCarts",
  SAVE_FOR_LATER: "SaveForLaters",
  APPROVAL_ROUTING: "ApprovalRouting",
};

const ORDER_RECEIPT = {
  USER_ORDER_RECEIPT_ORDER_ID: "UserOrderReceiptOrderId",
  SHOW_SHIPPING_CONSTRAINT: "ShowShippingConstraints",
};

const ORDER_DISCOUNT = {
  COUPONCODE: "COUPONCODE",
  VOUCHERNUMBER: "VOUCHERNUMBER",
};

export { ORDER, ORDER_DATA_TYPE, TARGET_ORDER_DATA_TYPE, ORDER_RECEIPT, ORDER_DISCOUNT };
