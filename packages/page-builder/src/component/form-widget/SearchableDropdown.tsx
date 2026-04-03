import { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { HelpLabel } from "@znode/base-components/znode-widget/form-widget/form-field/HelpLabel";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash";

interface IPagination {
  pageIndex: number;
  totalPages: number;
  pageSize: number;
  totalResults: number;
}

interface ISearchableDropdownProps<T> {
  initialItems: Array<T>;
  initialPagination: IPagination;
  initialLoading: boolean;
  label: string;
  error?: string;
  disabled?: boolean;
  searchInputPlaceholder?: string;
  selected: string;
  hasRequired?: boolean;
  getItemKey: (item: T) => string;
  getItemValue: (item: T) => string | undefined;
  renderItems: (item: T) => ReactNode;
  onSelect: (item: T | undefined) => T | undefined;
  onTouch?: () => void;
  onBlur?: () => void;
  fetchItems: (
    searchValue: string,
    pageIndex: number,
    pageSize: number
  ) => Promise<{
    items: Array<T>;
    pagination: IPagination;
  }>;
  helpDescription?: string;
  dropdownSelectMessage: string;
}
export function SearchableDropdown<T>(props: ISearchableDropdownProps<T>) {
  // Destructure Props
  const {
    error = "",
    label = "",
    disabled = false,
    searchInputPlaceholder = "Search",
    initialPagination,
    initialItems,
    selected,
    hasRequired = false,
    getItemKey,
    getItemValue,
    renderItems,
    onSelect,
    fetchItems,
    helpDescription = "",
    dropdownSelectMessage,
    onBlur,
  } = props;

  // Creating States
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<T[]>(initialItems);
  const [openUpwards, setOpenUpwards] = useState(false); 

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  // Derived States

  useEffect(() => {
    isOpenRef.current = isOpen; // keep ref updated with current state
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpenRef.current) {
          setIsOpen(false);
          if (onBlur) {
            onBlur();
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLoadMore() {
    setPaginationLoading(true);
    try {
      const response = await fetchItems(searchQuery, pagination.pageIndex + 1, pagination.pageSize);

      setItems((s) => [...s, ...response.items]);
      setPagination(response.pagination);

      const paginationDetails = response.pagination;
      if (paginationDetails.pageIndex === paginationDetails.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
      setItems([]);
    } finally {
      setPaginationLoading(false);
    }
  }

  async function handleFetchItems(value: string) {
    setPaginationLoading(true);

    try {
      const pageIndex = 1;
      const response = await fetchItems(value, pageIndex, pagination.pageSize);

      if (response) {
        setItems(response.items);
        setPagination(response.pagination);

        const paginationDetails = response.pagination;

        if (paginationDetails && paginationDetails.pageIndex === paginationDetails.totalPages) {
          setHasMore(false);
        }
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setPaginationLoading(false);
    }
  }

  function handleToggleDropdown() {
    const willOpen = !isOpen;
    if (willOpen) {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpwards(spaceBelow < 250 && spaceAbove > spaceBelow); 
      }

      setItems(initialItems);
      setPagination(initialPagination);
      setHasMore(true);
      setSearchQuery("");
    }

    setIsOpen(willOpen);
  }

  function handleSelect(option: T) {
    onSelect(option);
    handleToggleDropdown();

    setSearchQuery("");
    setHasMore(true);
    setItems(initialItems);
    setPagination(initialPagination);
  }

  const handleDebounceFetch = useCallback(
    debounce(async (value: string) => {
      setItems([]);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      setHasMore(true);
      handleFetchItems(value);
    }, 1000),
    []
  );

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    handleDebounceFetch(value);
  }

  return (
    <div className="relative">
      <HelpLabel labelTitle={label} hasRequired={hasRequired} helpDescription={helpDescription} />

      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={`w-full border px-4 py-2 text-left flex justify-between items-center rounded transition h-10
          ${props.disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-black hover:bg-gray-50"}`}
        >
          <span>{selected.length === 0 ? <span className="text-gray-400">{dropdownSelectMessage}</span> : selected}</span>
          <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`absolute z-10 w-full rounded-md bg-white border border-gray-300 shadow-lg 
              ${openUpwards ? "bottom-full mb-1" : "top-full mt-1"}`}
          >
            <div className="p-2">
              <input type="text" placeholder={searchInputPlaceholder} value={searchQuery} onChange={handleOnChange} className="w-full border p-2 rounded text-sm" />
            </div>
            <ul id="form-dropdown-scroll" className="max-h-40 overflow-auto">
              {items.length === 0 && !paginationLoading && <li className="p-2 text-center text-sm text-gray-500">No records found</li>}
              <InfiniteScroll
                dataLength={items.length}
                next={handleLoadMore}
                hasMore={hasMore}
                loader={paginationLoading ? <div className="p-2 text-center text-sm">Loading...</div> : undefined}
                scrollableTarget="form-dropdown-scroll"
              >
                {items.map((option: T) => (
                  <li
                    key={getItemKey(option)}
                    onClick={() => handleSelect(option)}
                    className={`cursor-pointer select-none px-4 py-2 hover:bg-blue-100 flex items-center ${selected === getItemValue(option) ? "bg-blue-100 font-semibold" : ""}`}
                  >
                    {renderItems(option)}
                  </li>
                ))}
              </InfiniteScroll>
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-errorColor text-sm mt-1">{error}</p>}
    </div>
  );
}
