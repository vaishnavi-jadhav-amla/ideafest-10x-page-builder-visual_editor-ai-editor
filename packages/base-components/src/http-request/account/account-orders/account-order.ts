export const getAccountOrderList = async (props: {
  sortValue: { [key: string]: string };
  pageIndex: number;
  pageSize: number;
  userId: number;
  currentFilters?: { key: string; value: string; type: string; columns: { status: string; date: string } }[];
}) => {
  const { sortValue, pageIndex, pageSize,userId ,currentFilters } = props;
  let sortQueryString = props.sortValue && Object.keys(props.sortValue).length > 0 ? `sortValue=${JSON.stringify(sortValue)}` : "sortValue={}";
  sortQueryString += `&pageIndex=${pageIndex}`;
  sortQueryString += `&pageSize=${pageSize}`;
  sortQueryString += `&userId=${userId}`;
  sortQueryString += `&currentFilters=${JSON.stringify(currentFilters)}`;

  const queryString = `${sortQueryString}`;
  const accountUserOrderData = await fetch(`/api/account/account-orders?${queryString}`, { cache: "no-store" });
  const response = await accountUserOrderData.json();
  return response;
};
