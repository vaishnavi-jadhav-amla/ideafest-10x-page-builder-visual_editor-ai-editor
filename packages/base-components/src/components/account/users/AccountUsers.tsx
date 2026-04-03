/* eslint-disable max-lines-per-function */
"use client";

import "../../../components/common/table/rc-table.scss";

import { Ban, CircleCheckBig, Eye, RotateCcw } from "lucide-react";
import { accountUserResetPassword, enableDisableAccount, getCustomerAccountList } from "../../../http-request";
import { getBaseUrl, getSavedUserSessionCallForClient } from "@znode/utils/common";
import { useEffect, useState } from "react";
import { useModal, useToast } from "../../../stores";

import AccountAction from "./AccountAction";
import AccountPasswordReset from "./AccountPasswordReset";
import Button from "../../common/button/Button";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import HeaderSort from "../../../components/common/header-sort/HeaderSort";
import { Heading } from "../../common/heading";
import { IAccountUser } from "@znode/types/account";
import { IFilterType } from "@znode/types/user";
import Link from "next/link";
import { Modal } from "../../common/modal";
import { PAGINATION } from "@znode/constants/pagination";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../../components/common/tooltip/ToolTip";
import { ZIcons } from "../../common/icons";
import { useTranslationMessages } from "@znode/utils/component";
import { useRouter } from "next/navigation";

export function AccountUsers() {
  const commonTranslation = useTranslationMessages("Common");
  const accountUserTranslation = useTranslationMessages("MyAccount");

  const { openModal, closeModal } = useModal();
  const { error, success } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [column, setColumn] = useState<string>("");
  const [sortValue, setSortValue] = useState({});
  const [userListData, setUserListData] = useState<IAccountUser[]>([]);
  const [sortFullNameFilter, setSortFullNameFilter] = useState<IFilterType>();
  const [sortUserNameFilter, setSortUserNameFilter] = useState<IFilterType>();
  const [sortEmailAddressFilter, setSortEmailAddressFilter] = useState<IFilterType>();
  const [selectedUser, setSelectedUser] = useState<IAccountUser>();
  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const router = useRouter();

  const operators = [
    { text: "contains", value: FilterOperators.Contains },
    { text: "is", value: FilterOperators.Is },
    { text: "beginsWith", value: FilterOperators.StartsWith },
    { text: "endsWith", value: FilterOperators.EndsWith },
  ];

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const onEnableDisableAccount = (userData: IAccountUser) => {
    setSelectedUser(userData);
    openModal("EnableDisableAccount");
  };

  const onPasswordReset = (userData: IAccountUser) => {
    setSelectedUser(userData);
    openModal("ResetPassword");
  };

  const onEnableDisableAction = async () => {
    if (selectedUser) {
      const payloadData = {
        userId: selectedUser.userId,
        accountId: selectedUser.accountId,
        isLock: selectedUser.isLock,
      };
      const passwordData = await enableDisableAccount(payloadData);
      if (!passwordData.hasError) {
        fetchData();
        if (passwordData.isSuccess && selectedUser.isLock) {
          success(accountUserTranslation("enableMessage"));
        } else {
          success(accountUserTranslation("disableMessage"));
        }
      } else {
        error(accountUserTranslation("userStatusUpdateError"));
      }
      closeModal();
    }
  };
  const onPasswordResetAction = async () => {
    const baseUrl = getBaseUrl();
    const payloadData = {
      userName: selectedUser?.userName,
      baseUrl,
      email: selectedUser?.email,
    };
    const passwordData = await accountUserResetPassword(payloadData);
    if (!passwordData.hasError) {
      success(accountUserTranslation("resetPasswordAccountUserText"));
      closeModal();
    } else {
      setIsLoading(false);
      error(accountUserTranslation("invalidUserName"));
    }
  };

  const getAccountUserTranslationOrdersURL = (record: IAccountUser) => {
    const { accountId, userId } = record;
    let url = "/account/account-orders?";
    if (accountId) url += `accountId=${accountId}&`;
    if (userId) url += `userId=${userId}`;
    return url;
  };

  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} columnName={commonTranslation("fullName")} headerKey="FullName" onSort={onColumnSort} />,
      dataIndex: "fullName",
      key: "fullName",
      width: 400,
      heading: commonTranslation("fullName"),
      displayOnMobile: true,

      render: (fullName: string, record: IAccountUser) => {
        const url = getAccountUserTranslationOrdersURL(record);
        return (
          <Link href={url} className="underline text-linkColor hover:text-hoverColor" data-test-selector={`linkFullName${record.userId}`}>
            {fullName}
          </Link>
        );
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="UserName" columnName={commonTranslation("userName")} onSort={onColumnSort} />,
      dataIndex: "userName",
      key: "userName",
      width: 300,
      heading: commonTranslation("userName"),
      render: (userName: string, record: IAccountUser) => <span data-test-selector={`spnUserName${record.userId}`}>{userName}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="Email" columnName={commonTranslation("emailAddress")} onSort={onColumnSort} />,
      dataIndex: "email",
      key: "emailAddress",
      width: 300,
      heading: commonTranslation("emailAddress"),
      render: (email: string, record: IAccountUser) => <span data-test-selector={`spnEmail${record.userId}`}>{email}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="RoleName" columnName={commonTranslation("role")} onSort={onColumnSort} />,
      dataIndex: "roleName",
      key: "role",
      width: 300,
      heading: commonTranslation("role"),
      displayOnMobile: true,
      render: (roleName: string, record: IAccountUser) => <span data-test-selector={`spnRole${record.userId}`}>{roleName}</span>,
    },
    {
      title: <div className="text-center">{commonTranslation("actions")}</div>,
      dataIndex: "",
      key: "actions",
      width: 300,
      heading: "",
      render: (record: IAccountUser) => {
        const url = getAccountUserTranslationOrdersURL(record);
        return (
          <div className="flex justify-center">
            <Button type="text" size="small" className="pr-3 pt-2" dataTestSelector={`btnViewOrderHistory${record.userId}`} onClick={() => router.push(url)}>
              <Tooltip message={commonTranslation("view")}>
                <Eye width="20px" height="20px" data-test-selector={`svgViewOrderHistory${record.userId}`} />
              </Tooltip>
            </Button>

            <Button
              type="text"
              size="small"
              onClick={() => onEnableDisableAccount(record)}
              dataTestSelector={`btn${record.isLock ? "Enable" : "Disable"}${record.userId}`}
              className="pr-3"
            >
              {record.isLock ? (
                <Tooltip message={commonTranslation("enable")}>
                  <ZIcons name="circle-check-big" height="18px" width="18px" data-test-selector={`svgEnable${record.userId}`} />
                </Tooltip>
              ) : (
                <Tooltip message={commonTranslation("disable")}>
                  <ZIcons name="ban" height="18px" width="18px" data-test-selector={`svgDisable${record.userId}`} />
                </Tooltip>
              )}
            </Button>
            <Button type="text" size="small" onClick={() => onPasswordReset(record)} dataTestSelector={`btnPasswordReset${record.userId}`}>
              <Tooltip message={accountUserTranslation("resetPasswordText")}>
                <ZIcons name="rotate-ccw" height="18px" width="18px" data-test-selector={`svgPasswordReset${record.userId}`} />
              </Tooltip>
            </Button>
          </div>
        );
      },
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    const userData = await getSavedUserSessionCallForClient();
    const currentFilters: IFilterType[] = [sortEmailAddressFilter, sortUserNameFilter, sortFullNameFilter].filter(
      (filter): filter is IFilterType => filter !== undefined && filter !== null && filter.key !== ""
    );
    const customerAccountList = await getCustomerAccountList({
      userName: userData?.userName,
      accountId: userData?.accountId,
      userId: userData?.userId,
      pageSize,
      pageIndex,
      sortValue,
      currentFilters,
    });

    if (!customerAccountList.hasError) {
      setUserListData(customerAccountList.users);
      setTotalResults(customerAccountList.totalResults);
    } else {
      setUserListData([]);
      setTotalResults(0);
    }
    setIsLoading(false);
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

  const onFilterClicked = (selectedOption: string, val: string, type: string) => {
    const applyFilter = { key: selectedOption, value: val, type: type, columns: { status: "" } };
    switch (type) {
      case "fullName":
        applyFilter.columns = { status: "fullName" };
        setSortFullNameFilter(applyFilter);
        break;
      case "emailAddress":
        applyFilter.columns = { status: "email" };
        setSortEmailAddressFilter(applyFilter);
        break;
      case "userName":
        applyFilter.columns = { status: "userName" };
        setSortUserNameFilter(applyFilter);
        break;
      default:
        break;
    }
  };

  const clearFilterValue = (type: string) => {
    setIsLoading(true);
    const removeFilterData = { key: "", value: "", type: "", columns: { status: "" } };
    switch (type) {
      case "fullName":
        setSortFullNameFilter(removeFilterData);
        break;
      case "emailAddress":
        setSortEmailAddressFilter(removeFilterData);
        break;
      case "userName":
        setSortUserNameFilter(removeFilterData);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex, sortValue, sortEmailAddressFilter, sortFullNameFilter, sortUserNameFilter]);

  const renderAction = (record: IAccountUser) => {
    const { accountId, userId } = record;
    let url = "/account/account-orders?";
    if (accountId) {
      url += `accountId=${accountId}&`;
    }
    if (userId) {
      url += `userId=${userId}`;
    }
    return (
      <div className="flex">
        <Link href={url}>
          <div className="flex">
            <Button type="text" size="small" dataTestSelector={`btnView${record.userId}`} className="mr-2">
              <Tooltip message={commonTranslation("view")}>
                <Eye width="20px" height="20px" data-test-selector={`svgView${record.userId}`} />
              </Tooltip>
            </Button>
          </div>
        </Link>
        <Button
          type="text"
          size="small"
          onClick={() => onEnableDisableAccount(record)}
          dataTestSelector={`btn${record.isLock ? "Enable" : "Disable"}${record.userId}`}
          className="mr-2"
        >
          {record.isLock ? (
            <Tooltip message={commonTranslation("enable")}>
              <CircleCheckBig width="20px" height="20px" data-test-selector={`svgEnable${record.userId}`} />
            </Tooltip>
          ) : (
            <Tooltip message={commonTranslation("disable")}>
              <Ban width="20px" height="20px" data-test-selector={`svgDisable${record.userId}`} />
            </Tooltip>
          )}
        </Button>
        <Button type="text" size="small" onClick={() => onPasswordReset(record)} dataTestSelector={`btnPasswordReset${record.userId}`} className="mr-2">
          <Tooltip message={accountUserTranslation("resetPasswordText")}>
            <RotateCcw width="20px" height="20px" data-test-selector={`svgPasswordReset${record.userId}`} />
          </Tooltip>
        </Button>
      </div>
    );
  };
  return (
    <>
      <div className="relative w-full">
        <div className="no-print">
          <Heading name={accountUserTranslation("accountUsers")} dataTestSelector="hdgAccountUsers" level="h1" customClass="uppercase" showSeparator />
          <div className="mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-3">
                <FilterSortComponent
                  buttonName={commonTranslation("fullName")}
                  onFilterSortClick={onFilterClicked}
                  options={operators}
                  defaultValue={0}
                  optionType={"fullName"}
                  inputValue={sortFullNameFilter}
                />
                {sortFullNameFilter && sortFullNameFilter?.type === "fullName" && (
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      clearFilterValue("fullName");
                    }}
                  >
                    <Tooltip message={commonTranslation("removeFilter")}>
                      <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgFullNameFilter" />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <FilterSortComponent
                  buttonName={commonTranslation("userName")}
                  onFilterSortClick={onFilterClicked}
                  options={operators}
                  defaultValue={0}
                  optionType={"userName"}
                  inputValue={sortUserNameFilter}
                />
                {sortUserNameFilter && sortUserNameFilter?.type === "userName" && (
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      clearFilterValue("userName");
                    }}
                  >
                    <Tooltip message={commonTranslation("removeFilter")}>
                      <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgUserNameFilter" />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <FilterSortComponent
                  buttonName={commonTranslation("emailAddress")}
                  onFilterSortClick={onFilterClicked}
                  options={operators}
                  defaultValue={0}
                  optionType={"emailAddress"}
                  inputValue={sortEmailAddressFilter}
                />
                {sortEmailAddressFilter && sortEmailAddressFilter?.type === "emailAddress" && (
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      clearFilterValue("emailAddress");
                    }}
                  >
                    <Tooltip message={commonTranslation("removeFilter")}>
                      <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgEmailAddressFilter" />
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </div>
          <TableWrapper renderAction={renderAction} columns={columns as []} loading={isLoading} expandedRowByKey="UserId" data={userListData as []} />
          {userListData && userListData.length > 0 && <Pagination totalResults={totalResults} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
        </div>
      </div>
      <Modal size="5xl" modalId="EnableDisableAccount" maxHeight="lg" customClass="overflow-hidden">
        <AccountAction enable={(selectedUser && selectedUser?.isLock) || false} onAction={onEnableDisableAction} />
      </Modal>
      <Modal size="5xl" modalId="ResetPassword" maxHeight="lg" customClass="overflow-hidden">
        <AccountPasswordReset onAction={onPasswordResetAction} />
      </Modal>
    </>
  );
}
