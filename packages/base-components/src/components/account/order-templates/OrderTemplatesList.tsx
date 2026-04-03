/* eslint-disable max-lines-per-function */
"use client";

import { useEffect, useState } from "react";
import { useCartDetails, useModal, useProduct, useToast } from "../../../stores";

import Button from "../../common/button/Button";
import { CLASSTYPE } from "@znode/constants/checkout";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import HeaderSort from "../../common/header-sort/HeaderSort";
import { IOrderTemplateCollectionDetails } from "@znode/types/account/order-templates";
import { IQuoteSearchByKey } from "@znode/types/account/quote";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import { Modal } from "../../common/modal/Modal";
import OrderTemplateConfirmDelete from "./OrderTemplateConfirmDelete";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { Trash2 } from "lucide-react";
import { ZIcons } from "../../common/icons";
import { copyOrderDetails } from "../../../http-request/account";
import { getOrderTemplateList } from "../../../http-request/account/order-template";
import { useRouter } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";

const OrderTemplateList = () => {
  const { refreshCartItems } = useCartDetails();
    const {
    product: { cartCount },
  } = useProduct();
  const orderTemplateTranslation = useTranslationMessages("OrderTemplates");
  const commonTranslation = useTranslationMessages("Common");

  const router = useRouter();
  const [orderTemplates, setOrderTemplates] = useState<IOrderTemplateCollectionDetails[] | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);
  const [selectedOrderTemplateIds, setSelectedOrderTemplateIds] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState({});
  const [column, setColumn] = useState<string>("");
  const [sortFilter, setSortFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isReorderLoading, setIsReorderLoading] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);

  const { openModal } = useModal();
  const { error } = useToast();

  const Operators = [
    { text: "contains", value: FilterOperators.Contains },
    { text: "is", value: FilterOperators.Is },
    { text: "beginsWith", value: FilterOperators.StartsWith },
    { text: "endsWith", value: FilterOperators.EndsWith },
  ];

  const clearFilterValue = (type: string) => {
    if (type === "name") {
      setSortFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
  };

  const onFilterClicked = (selectedOption: string, val: string, type: string) => {
    if (type === "name") {
      setSortFilter({ key: selectedOption, value: val, type: type, columns: { status: "TemplateName", date: "Name" } });
    }
  };

  const getOrderTemplateListData = async () => {
    setIsLoading(true);
    try {
      const currentFilters = [sortFilter].filter((val) => val !== undefined && val !== null && val?.key !== "");
      const orderTemplateList = await getOrderTemplateList({
        classType: CLASSTYPE.ORDER_TEMPLATE,
        pageSize: pageSize,
        pageIndex: pageIndex,
        sortValue: sortValue,
        currentFilters: currentFilters as IQuoteSearchByKey[],
      });

      const orderTemplateListCount = orderTemplateList.collectionDetails?.length;
      if (orderTemplateList && orderTemplateListCount === 0 && pageIndex !== 1) {
        setPageIndex(pageIndex - 1);
        setIsLoading(true);
      }

      setOrderTemplates(orderTemplateListCount ? orderTemplateList?.collectionDetails : undefined);
      setTotalResults(orderTemplateList?.paginationDetail?.totalResults);
      setSelectedRowKeys([]);
      setSelectedOrderTemplateIds([]);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (ClassNumber: string) => {
    setSelectedOrderTemplateIds([ClassNumber]);
    openModal("OrderTemplateConfirmDelete");
  };

  const moveToCart = async (classNumber: string) => {
    if (classNumber) {
      setIsReorderLoading(true);
      const response = await copyOrderDetails({ orderType: CLASSTYPE.ORDER_TEMPLATE, orderNumber: classNumber });
      if (response.isSuccess) {
      !cartCount && refreshCartItems();
        router.push("/cart");
        setIsReorderLoading(false);
      } else {
        router.push(`/account/order-templates/edit?classNumber=${classNumber}`);
        setIsReorderLoading(false);
      }
    }
  };

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  useEffect(() => {
    getOrderTemplateListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortValue, pageIndex, pageSize, sortFilter]);

  const handleSelectAll = () => {
    const allTemplateIds = (orderTemplates && orderTemplates.map((record) => record.classNumber)) || [];
    const newSelectedRowKeys = selectedRowKeys.length === allTemplateIds.length ? [] : allTemplateIds;
    setIsSelectAllChecked(!isSelectAllChecked);
    setSelectedRowKeys(newSelectedRowKeys || []);
    isSelectAllChecked && setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: string[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const handleCheckboxChange = (key: string) => {
    const newSelectedRowKeys = selectedRowKeys.includes(key) ? selectedRowKeys.filter((k: string) => k !== key) : [...selectedRowKeys, key];
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length === orderTemplates?.length) {
      setIsSelectAllChecked(!isSelectAllChecked);
    }
    isSelectAllChecked && setIsSelectAllChecked(false);
  };

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setIsLoading(true);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
    setIsLoading(true);
  };

  const handleMultipleDelete = () => {
    if (!selectedRowKeys?.length) {
      error(orderTemplateTranslation("noRecordsSelected"));
      return;
    }
    setSelectedOrderTemplateIds([...selectedRowKeys]);
    openModal("OrderTemplateConfirmDelete");
  };

  const columns = [
    {
      title: <input type="checkbox" aria-label="checkbox" checked={isSelectAllChecked} onChange={() => handleSelectAll()} data-test-selector="chkSelectAll" />,
      dataIndex: "",
      width: 50,
      key: "index",
      displayOnMobile: true,
      heading: "",
      render: (record: IOrderTemplateCollectionDetails) => (
        <input
          type="checkbox"
          aria-label="checkbox"
          checked={selectedRowKeys.includes(record?.classNumber)}
          onChange={() => handleCheckboxChange(record?.classNumber)}
          data-test-selector={`chkRowSelect${record.classNumber}`}
        />
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="Name" columnName={orderTemplateTranslation("templateName")} onSort={onColumnSort} />,
      dataIndex: "className",
      width: 400,
      key: "className",
      heading: orderTemplateTranslation("templateName"),
      displayOnMobile: true,
      render: (className: string, orderTemplate: IOrderTemplateCollectionDetails) => (
        <div className="flex items-center">
          <Link
            className="text-linkColor hover:text-hoverColor underline"
            href={`${`/account/order-templates/edit?classNumber=${orderTemplate.classNumber}`}`}
            data-test-selector={`linkTemplateName${orderTemplate.classNumber}`}
          >
            {className}
          </Link>
        </div>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="Quantity" columnName={commonTranslation("quantity")} onSort={onColumnSort} />,
      dataIndex: "quantity",
      width: 400,
      key: "quantity",
      heading: commonTranslation("quantity"),
      render: (quantity: number, record: IOrderTemplateCollectionDetails) => <span data-test-selector={`spnQuantity${record.classNumber}`}>{quantity}</span>,
    },
    {
      title: orderTemplateTranslation("createdDate"),
      dataIndex: "createdDate",
      heading: orderTemplateTranslation("createdDate"),
      key: "createdDate",
      width: 400,
      render: (createdDate: string, record: IOrderTemplateCollectionDetails) => <span data-test-selector={`spnCreatedDate${record.classNumber}`}>{createdDate}</span>,
    },
    {
      title: orderTemplateTranslation("modifiedDate"),
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      heading: orderTemplateTranslation("modifiedDate"),
      width: 400,
      render: (ModifiedBy: string, record: IOrderTemplateCollectionDetails) => <span data-test-selector={`spnModifiedDate${record.classNumber}`}>{ModifiedBy}</span>,
    },
    {
      title: <div className="text-center">{commonTranslation("actions")}</div>,
      dataIndex: "",
      key: "OmsTemplateId",
      width: 200,
      heading: "",
      render: (record: IOrderTemplateCollectionDetails) => renderAction(record),
    },
  ];

  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const renderAction = (record: IOrderTemplateCollectionDetails) => {
    return (
      <div className="flex items-center justify-center">

        <Link href={`${`/account/order-templates/edit?classNumber=${record.classNumber}`}`} data-test-selector={`linkEdit${record.classNumber}`} aria-label="Edit Link">
          <Tooltip message={commonTranslation("edit")}>
            <ZIcons name="pencil" data-test-selector={`svgEdit${record.classNumber}`} />
          </Tooltip>
        </Link>

        <Button
          type="text"
          size="small"
          className="px-3"
          dataTestSelector={`btnMoveToCart${record.classNumber}`}
          onClick={() => moveToCart(record.classNumber)}
          disabled={record.quantity === 0 ? true : false}
        >
          <Tooltip message={orderTemplateTranslation("moveToCart")}>
            <ZIcons name="shopping-cart" fill="black" height={"20px"} width={"20px"} data-test-selector={`svgMoveToCart${record.classNumber}`} />
          </Tooltip>
        </Button>

        <Button type="text" size="small" dataTestSelector={`btnRemove${record.classNumber}`} onClick={() => confirmDelete(record.classNumber)}>
          <Tooltip message={commonTranslation("remove")}>
            <Trash2 width="20px" height="20px" data-test-selector={`svgRemove${record.classNumber}`} />
          </Tooltip>
        </Button>
      </div>
    );
  };
  return (
    <div>
      <div className="sm:flex justify-between items-center">
        <div className="flex items-center gap-3" data-test-selector="divTemplateName">
          <FilterSortComponent buttonName={orderTemplateTranslation("templateName")} onFilterSortClick={onFilterClicked} options={Operators} defaultValue={0} optionType={"name"} inputValue={sortFilter} />
          {sortFilter && sortFilter?.type === "name" && (
            <div
              className="flex justify-center items-center cursor-pointer"
              data-test-selector="divCloseTemplateNameFilter"
              onClick={() => {
                clearFilterValue("name");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="CloseStatusFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-2 sm:mt-0">
          <Button type="primary" size="small" dataTestSelector="btnToolsDelete" ariaLabel="delete button" onClick={() => handleMultipleDelete()}>
            {orderTemplateTranslation("delete")}
          </Button>
          <Button
            type="primary"
            size="small"
            className="ml-3"
            dataTestSelector="btnCreateOrderTemplate"
            onClick={() => router.push("/account/order-templates/create")}
            ariaLabel="create template button"
          >
            {orderTemplateTranslation("createTemplate")}
          </Button>
        </div>
      </div>
      <TableWrapper
        renderAction={renderAction}
        columns={columns as []}
        loading={isLoading}
        expandedRowByKey="OmsTemplateId"
        data={orderTemplates as []}
        rowSelection={rowSelection}
      />
      {orderTemplates ? <Pagination totalResults={totalResults || 0} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} /> : null}
      {selectedOrderTemplateIds.length > 0 && (
        <Modal size="5xl" modalId="OrderTemplateConfirmDelete">
          <OrderTemplateConfirmDelete
            templateIds={selectedOrderTemplateIds}
            updatedOrderTemplateList={getOrderTemplateListData}
            setIsSelectAllChecked={setIsSelectAllChecked}
            setSelectedRowKeys={setSelectedRowKeys}
          />
        </Modal>
      )}
      {isReorderLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <LoaderComponent isLoading={true} width="50px" height="50px" />
        </div>
      ) : null}
    </div>
  );
};
export default OrderTemplateList;
