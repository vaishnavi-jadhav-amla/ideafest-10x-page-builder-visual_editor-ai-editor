"use client";

import "./account-name.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ZIcons } from "../../common/icons";
import { SETTINGS } from "@znode/constants/settings";
import { getUserAccountList } from "../../../http-request";
import { LoaderComponent } from "../../common/loader-component";
import { debounce } from "lodash";
import { getLocalStorageData, setLocalStorageData, useTranslationMessages } from "@znode/utils/component";
import { IUserAccountList, IUserAccountListResponse } from "@znode/types/user";
import { Tooltip } from "../tooltip";
import { PAGINATION } from "@znode/constants/pagination";
import { logClient } from "@znode/logger";

interface IPaginationData {
  pageNumber: number;
  pageSize: number;
  searchTerm: null | string;
  totalResults: number;
}

interface IAccountDataProps {
  accountCode: string;
  selectedAccountDetails: IUserAccountList | null;
  handleSelectedAccountDetails: (_data: IUserAccountList | null) => void;
}
export function AccountNameFilter({ accountCode = "", selectedAccountDetails, handleSelectedAccountDetails }: IAccountDataProps) {
  const switchAccountMessages = useTranslationMessages("SwitchAccount");
  const commonTranslation = useTranslationMessages("Common");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNumber: PAGINATION.DEFAULT_TABLE_PAGE_INDEX,
    pageSize: Number(PAGINATION.DEFAULT_PAGINATION),
    searchTerm: null,
    totalResults: 0,
  });
  const [accountList, setAccountList] = useState<IUserAccountList[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  useEffect(() => {
    if (isMenuOpen && inputRef?.current) {
      inputRef.current.value = paginationData.searchTerm || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserAccountList = async (parentAccountCode: string) => {
    try {
      setLoading(true);
      const { searchTerm, pageNumber, pageSize } = paginationData;
      const response: IUserAccountListResponse = await getUserAccountList({ accountCode: parentAccountCode, pageNumber, pageSize, searchTerm: searchTerm?.trim() ?? "" });
      if (Array.isArray(response?.accountList)) {
        const finalAccountList = pageNumber === 1 ? response.accountList : [...accountList, ...response.accountList];
        // for showing selected accountList;
        setAccountList(finalAccountList);
        setPaginationData({ ...paginationData, totalResults: response?.totalResults || 0 });
      }
    } catch (error) {
      logClient.error("Error in fetching account list.");
      setAccountList([]);
    } finally {
      setLoading(false);
    }
  };

  const { pageNumber, searchTerm } = paginationData;
  useEffect(() => {
    let parentAccountCode = getParentAccountCode() || "";
    if (!parentAccountCode) {
      setParentAccountCode(accountCode);
      parentAccountCode = accountCode;
    }

    fetchUserAccountList(parentAccountCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchTerm]);

  const handleAccountFilter = async (accountData: IUserAccountList) => {
    handleSelectedAccountDetails({ accountId: accountData?.accountId, accountName: accountData?.accountName, type: accountData?.type });
    setMenuOpen(false);
  };

  const getParentAccountCode = () => {
    try {
      const parentAccountCode = getLocalStorageData("parentAccountCode");
      return parentAccountCode;
    } catch (err) {
      logClient.error("Failed to get parentAccountCode.");
      return null;
    }
  };

  const setParentAccountCode = (accountCode: string) => {
    setLocalStorageData("parentAccountCode", accountCode);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((searchKeyword: string) => {
      setPaginationData((prev) => ({
        ...prev,
        pageNumber: 1,
        searchTerm: searchKeyword,
      }));
      setAccountList([]);
    }, 500),
    []
  );

  const removeFilter = () => {
    handleSelectedAccountDetails(null);
  };

  const renderAccounts = () => {
    return (
      <div id="scrollableDivContainer" className="custom-scroll pr-2 max-h-[130px] h-full overflow-auto">
        <InfiniteScroll
          dataLength={accountList?.length}
          next={() => setPaginationData({ ...paginationData, pageNumber: paginationData.pageNumber + 1 })}
          hasMore={paginationData.totalResults > accountList.length}
          loader={loading && <LoaderComponent isLoading={true} height="20px" width="20px" />}
          scrollableTarget="scrollableDivContainer"
        >
          {accountList.map((data: IUserAccountList, i: number) => (
            <li key={data.accountId} className={`cursor-pointer ${i === accountList.length - 1 ? "" : "border-b"} font-medium`} onClick={() => handleAccountFilter(data)}>
              <div className={`hover:bg-gray-100 py-1.5 px-1 text-sm text-textColor ${selectedAccountDetails?.accountId === data.accountId ? "bg-gray-100" : ""}`}>
                {data.accountName}
              </div>
            </li>
          ))}
        </InfiniteScroll>
      </div>
    );
  };

  if (!accountList?.length && paginationData.searchTerm === null) return null;

  return (
    <div className="flex gap-2 items-center" data-test-selector="divAccountNameFilter">
      <div className="flex p-2 items-center border-slate-400 border min-w-28">
        <div className="relative w-full" role="menu" ref={dropdownRef}>
          <div className="flex items-center  w-full" role="menuitem">
            <div onClick={toggleMenu} data-test-selector="divAccountArrow" className="flex justify-between w-full text-sm  cursor-pointer text-textColor font-semibold">
              {selectedAccountDetails?.accountName || switchAccountMessages("account")}
              <ZIcons name="chevron-down" className="ml-1.5" data-test-selector="svgAccountArrowDown" color={SETTINGS.ARROW_COLOR} />
            </div>
          </div>
          {isMenuOpen && (
            <div className="filter-account-popover">
              <div className="account-arrow-container">
                <div className="hidden account-arrow-border md:flex"></div>
                <div className="hidden account-arrow-center md:flex"></div>
              </div>
              <div className="content lg:min-w-max">
                <div className="flex items-center mb-0 md:mb-2">
                  <ul className="w-full p-2 bg-white md:p-0">
                    <li className="items-center hidden w-full px-1 pb-2 mb-2 text-sm border-b md:flex font-medium" data-test-selector="listSelectLocaleLabel">
                      {switchAccountMessages("selectAccount")}
                    </li>
                    <li>
                      <input
                        ref={inputRef}
                        className="w-full h-8 px-2 py-1 mb-1 input font-normal"
                        placeholder={switchAccountMessages("search")}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </li>
                    {renderAccounts()}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedAccountDetails?.accountId && (
        <div className="flex justify-center items-center cursor-pointer" onClick={removeFilter}>
          <Tooltip message={commonTranslation("removeFilter")}>
            <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgRemoveDateFilter" />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
