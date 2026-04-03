import { IOrderHistoryResponse, IOrderListRequest } from "@znode/types/account";
import { useEffect, useState } from "react";

import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { getOrderType } from "../../../../http-request";

const useOrderData = ({ pageSize, pageIndex, sortValue = {}, currentFilters = null,accountId=null }: IOrderListRequest) => {
  const [orderHistoryData, setOrderHistoryData] = useState<IOrderHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const request: IOrderListRequest = {
        orderType: ORDER_DATA_TYPE.ORDER,
        pageSize,
        pageIndex,
        sortValue,
        currentFilters: currentFilters,
        accountId
      };
      const data = (await getOrderType(request)) || {};
      setOrderHistoryData(data);
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageSize > 0 && pageIndex > 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex, sortValue, JSON.stringify(currentFilters),accountId]);

  return {
    orderHistoryData,
    loading,
    error,
    fetchData,
  };
};

export default useOrderData;
