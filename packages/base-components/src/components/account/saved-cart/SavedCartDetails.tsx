/* eslint-disable max-lines-per-function */
"use client";

import { ISavedCart, ISavedCartCollectionDetails } from "@znode/types/account/saved-cart";
import { useTranslationMessages } from "@znode/utils/component";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { CLASSTYPE } from "@znode/constants/checkout";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import HeaderSort from "../../common/header-sort/HeaderSort";
import { Heading } from "../../common/heading";
import { IGeneralSetting } from "@znode/types/general-setting";
import { IQuoteSearchByKey } from "@znode/types/account";
import Link from "next/link";
import { Modal } from "../../common/modal";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import { SavedCartConfirmDelete } from "./SavedCartConfirmDelete";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { copyOrderDetails } from "../../../http-request/account";
import { getGeneralSettingList } from "../../../http-request";
import { getSavedCartList } from "../../../http-request/account/saved-cart/saved-cart-list";
import { useCartDetails, useModal, useProduct } from "../../../stores";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";

export const SavedCartDetails = () => {
  const { refreshCartItems } = useCartDetails();
  const Operators = [
    { text: "contains", value: FilterOperators.Contains },
    { text: "is", value: FilterOperators.Is },
    { text: "beginsWith", value: FilterOperators.StartsWith },
    { text: "endsWith", value: FilterOperators.EndsWith },
  ];

  const commonTranslations = useTranslationMessages("Common");
  const savedCartTranslations = useTranslationMessages("SavedCart");
  const cartTranslations = useTranslationMessages("Cart");
  const {
    product: { cartCount },
  } = useProduct();

  const redirectToCart = () => {
    !cartCount && refreshCartItems();
    router.push("/cart");
  };

  const [savedCartList, setSavedCartList] = useState<ISavedCart[]>();
  const [selectedSavedCartTemplateId, setSelectedSavedCartTemplateId] = useState<string[]>([]);
  const { success, error } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [sortValue, setSortValue] = useState({});
  const [column, setColumn] = useState<string>("");
  const { openModal } = useModal();
  const [sortFilter, setSortFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortDateFilter, setSortDateFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [generalSetting, setGeneralSetting] = useState<IGeneralSetting>();
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const getPortalDetails = async () => {
    const generalSetting = await getGeneralSettingList();
    setGeneralSetting(generalSetting);
  };

  useEffect(() => {
    getPortalDetails();
  }, []);

  const fetchSavedCartsList = async () => {
    setLoading(true);
    try {
      const currentFilters = [sortDateFilter, sortFilter].filter((val) => val !== undefined && val !== null && val?.key !== "");
      const savedCartListData = await getSavedCartList({
        classType: CLASSTYPE.SAVED_CARTS,
        pageSize: pageSize,
        pageIndex: pageIndex,
        sortValue: sortValue,
        currentFilters: currentFilters as IQuoteSearchByKey[],
      });
      const savedCartListCount = savedCartListData?.collectionDetails?.length;
      if (savedCartListData && savedCartListCount === 0 && pageIndex !== 1) {
        setPageIndex(pageIndex - 1);
        setLoading(true);
      }
      const savedCartList = (savedCartListData?.collectionDetails || []) as ISavedCart[];
      setTotalResults(savedCartListData?.paginationDetail?.totalResults);
      setSavedCartList(savedCartList || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCartsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortValue, sortFilter, sortDateFilter, pageIndex, pageSize, generalSetting]);

  const onFilterClicked = (selectedOption: string, val: string, type: string) => {
    if (type == "status") {
      setSortFilter({ key: selectedOption, value: val, type: type, columns: { status: "Name", date: "OrderDate" } });
    }
    if (type == "date") {
      setSortDateFilter({ key: selectedOption, value: val, type: type, columns: { status: "Name", date: "OrderDate" } });
    }
  };

  const clearFilterValue = (type: string) => {
    if (type == "status") {
      setSortFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type == "date") {
      setSortDateFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
  };

  const confirmDelete = (classNumber: string) => {
    openModal("SavedCartConfirmDelete");
    setSelectedSavedCartTemplateId([classNumber]);
  };

  const handleSelectAll = () => {
    const allTemplateIds = (savedCartList && savedCartList.map((record) => record.classNumber)) || [];
    const newSelectedRowKeys = selectedRowKeys.length === allTemplateIds.length ? [] : allTemplateIds;
    setIsSelectAllChecked(!isSelectAllChecked);
    setSelectedRowKeys(newSelectedRowKeys || []);
    isSelectAllChecked && setSelectedRowKeys([]);
  };

  const handleCheckboxChange = (key: string) => {
    const newSelectedRowKeys = selectedRowKeys.includes(key) ? selectedRowKeys.filter((k: string) => k !== key) : [...selectedRowKeys, key];
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length === savedCartList?.length) {
      setIsSelectAllChecked(!isSelectAllChecked);
    }
    isSelectAllChecked && setIsSelectAllChecked(false);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: string[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const handleMultipleDelete = () => {
    if (!selectedRowKeys?.length) {
      error(savedCartTranslations("noRecordsSelected"));
      return;
    }
    setSelectedSavedCartTemplateId([...selectedRowKeys]);
    openModal("SavedCartConfirmDelete");
  };

  const moveToCart = async (classNumber: string) => {
    if (classNumber) {
      const status = await copyOrderDetails({ orderType: CLASSTYPE.SAVED_CARTS, orderNumber: classNumber });
      if (status && status.isSuccess) {
        success(savedCartTranslations("successMoveToCart"));
        redirectToCart();
      } else if (status.isSuccess === false) {
        error(savedCartTranslations("failedMoveToCart"));
        redirectToCart();
      } else {
        router.push(`/account/saved-cart/edit?classNumber=${classNumber}`);
      }
    }
  };

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
  };

  /**
   * Columns list which will display as header of the table
   */
  const columns = [
    {
      title: <input type="checkbox" aria-label="checkbox" checked={isSelectAllChecked} onChange={handleSelectAll} data-test-selector="chkSelectAll" />,
      dataIndex: "",
      width: 50,
      key: "index",
      displayOnMobile: true,
      heading: "",
      render: (record: ISavedCartCollectionDetails) => (
        <input
          type="checkbox"
          aria-label="checkbox"
          checked={selectedRowKeys.includes(record?.classNumber)}
          onChange={() => handleCheckboxChange(record?.classNumber)}
          data-test-selector={`chkSelectRow${record.classNumber}`}
        />
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={savedCartTranslations("savedCartName")} headerKey="Name" onSort={onColumnSort} />,
      dataIndex: "className",
      key: "className",
      width: 400,
      displayOnMobile: true,
      heading: savedCartTranslations("savedCartName"),
      render: (className: string, record: ISavedCart) => {
        return (
          <Link
            href={`/account/saved-cart/edit?cartNumber=${record?.classNumber}`}
            className="underline text-linkColor hover:text-hoverColor"
            data-test-selector={`linkSavedCart${record.classNumber}`}
          >
            {className}
          </Link>
        );
      },
    },
    {
      title: (
        <HeaderSort currentSortColumn={column} headerKey="Quantity" columnName={commonTranslations("quantity")} onSort={onColumnSort} isVisible={true} alignToCenter={false} />
      ),
      dataIndex: "quantity",
      key: "quantity",
      heading: commonTranslations("quantity"),
      width: 300,
      render: (quantity: number, record: ISavedCart) => <span data-test-selector={`spnQuantity${record.classNumber}`}>{quantity}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="createdDate" columnName={commonTranslations("createdDate")} onSort={onColumnSort} isVisible={false} />,
      dataIndex: "createdDate",
      key: "createdDate",
      heading: commonTranslations("createdDate"),
      width: 300,
      render: (createdDate: string, record: ISavedCart) => <span data-test-selector={`spnCreatedDate${record.classNumber}`}>{createdDate}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="modifiedDate" columnName={commonTranslations("modifiedDate")} onSort={onColumnSort} isVisible={false} />,
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      heading: commonTranslations("modifiedDate"),
      width: 300,
      render: (modifiedDate: string, record: ISavedCart) => <span data-test-selector={`spnModifiedDate${record.classNumber}`}>{modifiedDate}</span>,
    },
    {
      title: <div className="text-center">{commonTranslations("actions")}</div>,
      dataIndex: "",
      key: "actions",
      heading: "",
      width: 300,
      render: (record: ISavedCart) => renderAction(record),
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

  const renderAction = (record: ISavedCart) => {
    return (
      <div className="flex justify-center">
        <Link
          href={`/account/saved-cart/edit?cartNumber=${record?.classNumber}`}
          aria-label={"Edit Saved Cart"}
          data-test-selector={`linkEditSavedCart${record.classNumber}`}
          className="cursor-pointer"
        >
          <Tooltip message={commonTranslations("edit")}>
            <ZIcons name="pencil" data-test-selector={`svgEditSavedCart${record.classNumber}`} />
          </Tooltip>
        </Link>

        <Button
          dataTestSelector={`btnMoveToCart${record.classNumber}`}
          className="xs:pt-0 p-0 border-none cursor-pointer px-3"
          onClick={() => moveToCart(record?.classNumber)}
          aria-label={"Move To Cart"}
          ripple={false}
          type="text"
          size="small"
          disabled={record?.quantity === 0}
        >
          <Tooltip message={cartTranslations("moveToCart")}>
            <ZIcons name="shopping-cart" fill="black" data-test-selector={`svgMoveToCart${record.classNumber}`} />
          </Tooltip>
        </Button>
        <Button
          dataTestSelector={`btnRemove${record.classNumber}`}
          className="p-0 border-none cursor-pointer"
          onClick={() => confirmDelete(record?.classNumber)}
          aria-label={"Confirm Delete"}
          ripple={false}
        >
          <Tooltip message={commonTranslations("remove")}>
            <ZIcons name="trash-2" data-test-selector={`svgRemove${record.classNumber}`} />
          </Tooltip>
        </Button>
      </div>
    );
  };

  return (
    <>
      <Heading name={savedCartTranslations("savedCarts")} customClass="uppercase" dataTestSelector="hdgSavedCart" level="h1" showSeparator />
      <div className="flex items-center justify-between gap-2">
        <div className="flex space-x-4">
          <div className="flex gap-3" data-text-selector="saveCartNameFilter">
            <FilterSortComponent
              buttonName={savedCartTranslations("savedCartName")}
              onFilterSortClick={onFilterClicked}
              options={Operators}
              defaultValue={0}
              optionType={"status"}
              inputValue={sortFilter}
            />
            {sortFilter && sortFilter?.type == "status" && (
              <div className="flex justify-center items-center cursor-pointer" onClick={() => clearFilterValue("status")}>
                <Tooltip message={commonTranslations("removeFilter")}>
                  <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgCloseStatusFilter" />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        <Button type="primary" size="small" onClick={() => handleMultipleDelete()} dataTestSelector="btnToolsDelete" ariaLabel="delete button" disabled={totalResults < 1}>
          {savedCartTranslations("delete")}
        </Button>
      </div>
      <div className="xs:overflow-x-scroll xs:w-full lg:overflow-x-hidden pb-10" data-test-selector="divOrderHistoryLink">
        <TableWrapper renderAction={renderAction} columns={columns as []} data={savedCartList as []} loading={loading} expandedRowByKey="SavedCartId" rowSelection={rowSelection} />
      </div>
      <div className="-mt-10">
        {savedCartList && savedCartList.length > 0 && <Pagination totalResults={totalResults || 0} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
      </div>

      <Modal size="3xl" modalId="SavedCartConfirmDelete">
        <SavedCartConfirmDelete
          templateId={selectedSavedCartTemplateId}
          updatedSaveCartList={fetchSavedCartsList}
          setIsSelectAllChecked={setIsSelectAllChecked}
          setSelectedRowKeys={setSelectedRowKeys}
        />
      </Modal>
    </>
  );
};
