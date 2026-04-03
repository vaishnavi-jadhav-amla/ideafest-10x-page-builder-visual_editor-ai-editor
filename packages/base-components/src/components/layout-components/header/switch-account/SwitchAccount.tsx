"use client";

import "./switch-account.scss";

import { IUser, IUserAccountList, IUserAccountListResponse } from "@znode/types/user";
import { getLocalStorageData, setLocalStorageData, useTranslationMessages } from "@znode/utils/component";
import { useCallback, useEffect, useRef, useState } from "react";
import { useProduct, useToast } from "../../../../stores";

import InfiniteScroll from "react-infinite-scroll-component";
import { LoaderComponent } from "../../../common/loader-component";
import { PAGINATION } from "@znode/constants/pagination";
import { SETTINGS } from "@znode/constants/settings";
import { ZIcons } from "../../../common/icons";
import { debounce } from "lodash";
import { deleteCartCookies } from "@znode/agents/cart/cart-helper";
import { getUserAccountList } from "../../../../http-request";
import { logClient } from "@znode/logger";
import { signIn } from "next-auth/react";

interface IPaginationData {
  pageNumber: number;
  pageSize: number;
  searchTerm: null | string;
  totalResults: number;
}
const initialPaginationData = {
  pageNumber: PAGINATION.DEFAULT_TABLE_PAGE_INDEX,
  pageSize: Number(PAGINATION.DEFAULT_PAGINATION),
  searchTerm: null,
  totalResults: 0,
};
export function SwitchAccount({
  session: { accountId = 0, accountCode = "", accountName = "", userName = "", crsName = "", crsUserId = null },
  isMobile = false,
}: {
  session: IUser;
  isMobile?: boolean;
}) {
  const { error } = useToast();
  const { updateCartCount } = useProduct();
  const inputRef = useRef<HTMLInputElement>(null);

  const switchAccountMessages = useTranslationMessages("SwitchAccount");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    ...initialPaginationData,
  });
  const [accountList, setAccountList] = useState<IUserAccountList[]>([]);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<IUserAccountList | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleAccountMenu = () => {
    setMenuOpen((open) => !open);
  };

  useEffect(() => {
    if (isMenuOpen && inputRef?.current) {
      inputRef.current.value = paginationData.searchTerm || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  useEffect(() => {
    setSelectedAccountDetails({ accountId: accountId || 0, accountName: accountName || "", type: "" });
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
      setParentAccountId(accountCode);
      parentAccountCode = accountCode;
    }

    fetchUserAccountList(parentAccountCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchTerm]);

  const switchAccount = async (accountData: IUserAccountList) => {
    try {
      const userData = await signIn("credentials", {
        redirect: false,
        username: userName,
        domainName: window.location.origin,
        switchAccount: true,
        accountId: accountData.accountId,
        ...(crsName && { crsName }),
        ...(crsUserId && { crsUserId }),
      });
      if (userData) {
        clearStorageAndCookies();
      }
    } catch (err) {
      error(`${switchAccountMessages("switchError")} "${accountData.accountName}". ${switchAccountMessages("pleaseTryAgain")}`);
    }
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

  const setParentAccountId = (accountCode: string) => {
    setLocalStorageData("parentAccountCode", accountCode);
  };

  const clearStorageAndCookies = () => {
    const parentAccountCode = getParentAccountCode();
    const lastActivity = getLocalStorageData("lastActivity");
    localStorage.clear();
    deleteCartCookies();
    updateCartCount(0);
    parentAccountCode && setParentAccountId(parentAccountCode);
    lastActivity && setLocalStorageData("lastActivity", lastActivity);
    window.location.href = window.location.pathname;
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

  const renderAccounts = () => {
    return (
      <div id="scrollableDivContainer" className="custom-scroll pr-2 h-full max-h-[130px] overflow-auto">
        <InfiniteScroll
          dataLength={accountList?.length}
          next={() => setPaginationData({ ...paginationData, pageNumber: paginationData.pageNumber + 1 })}
          hasMore={paginationData.totalResults > accountList.length}
          loader={loading && <LoaderComponent isLoading={true} height="20px" width="20px" />}
          scrollableTarget="scrollableDivContainer"
        >
          {accountList.map((data: IUserAccountList, i: number) => (
            <li key={data.accountId} className={`cursor-pointer ${i === accountList.length - 1 ? "" : "border-b"} font-medium`} onClick={() => switchAccount(data)}>
              <div
                title={data.accountName}
                className={`hover:bg-gray-100 py-1.5 px-1 text-sm truncate text-textColor ${selectedAccountDetails?.accountId === data.accountId ? "bg-gray-100" : ""}`}
              >
                {data.accountName}
              </div>
            </li>
          ))}
        </InfiniteScroll>
      </div>
    );
  };

  const isNull = paginationData.searchTerm === null;
  if ((isNull && !accountList.length) || !selectedAccountDetails?.accountId || (isNull && accountList?.length === 1)) return null;

  return (
    <div className={!isMobile ? "px-4 border-r-2 border-black" : ""} data-test-selector="divSwitchAccount">
      <div className="relative" role="menu" ref={dropdownRef}>
        <div className="flex items-center justify-center" role="menuitem">
          <div onClick={toggleAccountMenu} data-test-selector="divSwitchAccountArrow" className="flex text-sm cursor-pointer text-textColor font-bold max-w-[200px]">
            <span className="truncate overflow-hidden whitespace-nowrap" title={selectedAccountDetails?.accountName}>
              {selectedAccountDetails?.accountName || "N/A"}
            </span>
            <ZIcons name="chevron-down" className="ml-1.5 flex-shrink-0" data-test-selector="svgAccountArrowDown" color={SETTINGS.ARROW_COLOR} />
          </div>
        </div>
        {isMenuOpen && (
          <div className="switch-account-popover absolute right-0 z-20 bg-white border border-gray-200 shadow-md mt-3">
            <div className="account-arrow-container">
              <div className="hidden account-arrow-border md:flex"></div>
              <div className="hidden account-arrow-center md:flex"></div>
            </div>
            <div className="content">
              <div className="flex items-center mb-0 md:mb-2">
                <ul className="w-full p-2 bg-white md:p-0">
                  <li className="items-center w-full px-1 pb-2 mb-2 text-sm border-b md:flex font-medium" data-test-selector="listSelectLocaleLabel">
                    {switchAccountMessages("switchAccount")}
                  </li>
                  <li>
                    <input
                      ref={inputRef}
                      className="w-full h-8 px-2 py-1 mb-2 input font-normal"
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
  );
}
