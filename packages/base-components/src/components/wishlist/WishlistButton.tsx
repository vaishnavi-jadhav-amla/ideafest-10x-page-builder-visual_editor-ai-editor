"use client";
import React, { useState } from "react";
import { createWishList, deleteWishList } from "../../../../base-components/src/http-request";
import { useTranslationMessages } from "@znode/utils/component";
import Button from "../common/button/Button";
import { useToast } from "../../stores/toast";
import { useUser } from "../../stores/user-store";
import { Heart } from "lucide-react";
import { WISHLIST } from "@znode/constants/wishlist";
import { Tooltip } from "../common/tooltip";
import { useWishListStore } from "../../stores/wishlist";
import { useStoreWithEqualityFn } from "zustand/traditional";
import {shallow} from "zustand/shallow";

interface IWishListButtonProps {
  sku: string;
  znodeProductId: number;
  fromQuickView?: boolean;
}

const checkIsMarked = (sku: string) => {
  const heartIcon = document.querySelector(`#wishlist-icon-${sku}`);
  const styleFill = heartIcon && heartIcon.getAttribute("style");
  const isFillNone = styleFill && styleFill.includes("fill: none");
  return !(isFillNone === null || isFillNone === "" || isFillNone);
};
const WishListButton: React.FC<IWishListButtonProps> = ({ znodeProductId, sku = "", fromQuickView = false }) => {
  const { error, success } = useToast();
  const { user } = useUser();

  const { wishlist, updateWishListSkus } = useStoreWithEqualityFn(
    useWishListStore,
    (state) => ({
      wishlist: state.wishListSkus,
      updateWishListSkus: state.updateWishListSkus,
    }),
    shallow
  );
  
  const existsInWishlist = wishlist.includes(sku);

  const toggleWishlist = () => {
      addProductToWishlist(existsInWishlist);
  };

  const wishlistTranslations = useTranslationMessages("WishList");
  const commonTranslations = useTranslationMessages("Common");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tooltipTitle, setTooltipTitle] = useState("");
  const addProductToWishlist = async (existsInWishlist: boolean) => {
    try {
      setIsLoading(true);
      if (!user) {
        error(wishlistTranslations("pleaseLogin"));
        return;
      }
      if(existsInWishlist)
      {
        removeProduct();
      }
      else {
        const createWishlistResponse = await createWishList({ sku });
        if (!createWishlistResponse?.hasError) {
          success(wishlistTranslations("successWishListAdded"));
          setTooltipTitle(wishlistTranslations("removeFromWishlist"));
          updateWishListSkus([sku], "ADD");
        } else if (createWishlistResponse?.hasError && createWishlistResponse?.errorCode === 2) {
          removeProduct();
        }
      }
    } catch (err) {
      error(wishlistTranslations("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async () => {
    try {
      const deleteWishlistResponse = await deleteWishList(sku);
      if (deleteWishlistResponse) {
        success(wishlistTranslations("successWishListRemoved"));
        setTooltipTitle(wishlistTranslations("addToWishlist"));
        updateWishListSkus([sku], "REMOVE");
      } else error(wishlistTranslations("error"));
    } catch (err) {
      error(commonTranslations("somethingWentWrong"));
    }
  };

  return (
    <div
      onMouseEnter={() => setTooltipTitle(checkIsMarked(sku) ? wishlistTranslations("removeFromWishlist") : wishlistTranslations("addToWishlist"))}
      onMouseLeave={() => setTooltipTitle("")}
    >
      <Tooltip message={isLoading ? "" : tooltipTitle} isFromModal={fromQuickView}>
        <Button
          type="text"
          size="small"
          onClick={toggleWishlist}
          dataTestSelector={`btnAddToWishList${znodeProductId}`}
          ariaLabel="wishlist icon button"
          loading={isLoading}
          loaderHeight="20px"
          loaderWidth="20px"
        >
          <Heart
            id={`wishlist-icon-${sku}`}
            data-wishlist-sku={sku}
            size={20}
            strokeWidth={2}
            color={WISHLIST.ICON_COLOR}
            {...((existsInWishlist) && { style: { fill: WISHLIST.ICON_FILL_COLOR } })}
          />
        </Button>
      </Tooltip>
    </div>
  );
};

export default WishListButton;