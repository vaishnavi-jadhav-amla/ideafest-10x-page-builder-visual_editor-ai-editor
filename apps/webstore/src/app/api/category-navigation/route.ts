import { sendError, sendSuccess } from "@znode/utils/server";

import { getMegaMenuCategories } from "@znode/agents/category";
import { getSavedUserSession, stringToBooleanV2 } from "@znode/utils/common";
import { IUser } from "@znode/types/user";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const categoryCode = searchParams.get("categoryCode") || "";
    const isAllCategory = stringToBooleanV2(searchParams.get("isAllCategory") || false);

    const userData: IUser | null = await getSavedUserSession();
    const { categories = [], isUserLoggedIn = false } = (await getMegaMenuCategories(userData, isAllCategory, categoryCode)) ?? {};
    return sendSuccess({ categories, isUserLoggedIn }, "Category/Subcategory list retrieved successfully for mega menu.");
  } catch (error) {
    return sendError("An error occurred while fetching the category list for mega menu." + String(error), 500);
  }
}
