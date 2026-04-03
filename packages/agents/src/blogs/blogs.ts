/* eslint-disable @typescript-eslint/no-explicit-any */
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterCollection, FilterKeys, FilterOperators, convertPascalCase, getPortalHeader } from "@znode/utils/server";
import { IAddBlogComment, IBlog, IBlogComment, IBlogDetails } from "@znode/types/blog";
import { WebStoreBlogNews_comment, WebStoreBlogNews_comments, WebStoreBlogNews_webstoreBlogNewsByBlogNewsCode, WebStoreBlogNews_webstoreBlogNewsGet } from "@znode/clients/v2";

import { convertDate } from "@znode/utils/component";
import { getGeneralSettingList } from "../general-setting";
import { getPortalDetails } from "../portal/portal";

export async function getBlogList(): Promise<IBlog[] | null> {
  try {
    const portalHeader = await getPortalHeader();
    const portalData = await getPortalDetails();
    // TODO: v2 API: Pass localId and portalId as empty strings because the API now requires local code and store code to be passed as strings.
    // TODO: v2 API: added type any because Type 'SEOUrlsResponse' is missing the following properties from type 'ISeoDetails': name, seoId
    // TODO: param should be dynamic

    const storeCode = portalData.storeCode || "";
    const localeCode = portalHeader.localeCode || "";
    const blogNewsType = "Blog";
    const activationDate = "2024-09-22";
    const blogNewsList: any = (await WebStoreBlogNews_webstoreBlogNewsGet(storeCode, blogNewsType, localeCode, activationDate)).BlogNewsList;
    const generalSettingsList = await getGeneralSettingList();

    const blogNewsData =
      blogNewsList && blogNewsList.length > 0
        ? blogNewsList?.map((blog: typeof blogNewsList extends undefined ? never : (typeof blogNewsList)[0]) => ({
          blogId: blog.BlogNewsId,
          mediaPath: `${portalData.mediaServerUrl}${blog.MediaPath}`,
          mediaId: blog.MediaId,
          // to do ActivationDate will get replaced by CreatedDate
          createdDate: blog?.ActivationDate ? convertDate(blog.ActivationDate, generalSettingsList?.dateFormat, generalSettingsList?.displayTimeZone) : "",
          blogTitle: blog.BlogNewsTitle,
          blogNewsCode: blog.BlogNewsCode,
          seoUrl: blog.SEOUrl
        }))
        : [];
    return blogNewsData;
  } catch (error) {
    logServer.error(AREA.BLOG_NEWS, errorStack(error));
    return null;
  }
}

/**
 * Gets the published blog news data based on its ID and locale ID.
 * @param blogId - The ID of the BlogNews item to retrieve.
 * @returns A promise that resolves to the detailed data of the specified BlogNews.
 */
export async function getBlogDetail(blogNewsCode: string): Promise<IBlogDetails | null> {
  try {
    const portalHeader = await getPortalHeader();
    const portalData = await getPortalDetails();
    const storeCode = portalData.storeCode || "";
    const localeCode = portalHeader.localeCode || "";
    const blogDetail = await WebStoreBlogNews_webstoreBlogNewsByBlogNewsCode(blogNewsCode, storeCode, localeCode);
    const blogNews = blogDetail?.BlogNews;

    const mediaURL: string = `${portalData.mediaServerUrl}${blogNews?.MediaPath}` || " ";
    if (!blogNews) {
      logServer.warn(AREA.BLOG_NEWS, `No data found for Blog ID: ${blogNewsCode}, Locale Code: ${localeCode}, Store Code: ${storeCode}`);
      return null;
    }

    const generalSettings = await getGeneralSettingList();
    return {
      blogId: blogNews.BlogNewsId as number,
      title: blogNews.BlogNewsTitle as string,
      body: blogNews.BlogNewsContent as string,
      mediaPath: mediaURL,
      allowGuestComment: String(blogNews.IsAllowGuestComment),
      createdDate: blogNews?.ActivationDate ? convertDate(blogNews.ActivationDate, generalSettings?.dateFormat, generalSettings?.displayTimeZone) : "",
      blogNewsCode: blogNews.BlogNewsCode as string,
      tags: blogNews.Tags as string,
    };
  } catch (error) {
    logServer.error(AREA.BLOG_NEWS, errorStack(error));
    return null;
  }
}

/**
 * Gets a list of user comments against a blog/news.
 * @param blogNewsId - The ID of the BlogNews item to retrieve comments for.
 * @returns A promise that resolves to an array of comments for the specified BlogNews.
 */
export async function getUserCommentList(blogNewsId: number): Promise<IBlogComment[] | []> {
  try {
    const filters: FilterCollection = new FilterCollection();
    filters.add(FilterKeys.BlogNewsId, FilterOperators.Equals, blogNewsId.toString() || "");
    const blogCommentDetail = await WebStoreBlogNews_comments(convertPascalCase(filters.filterTupleArray));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blogNewsCommentList: any = blogCommentDetail?.BlogNewsCommentList;
    const commentList: IBlogComment[] =
      blogNewsCommentList?.map((comment: { BlogNewsId: number; BlogNewsCommentId: number; BlogComment: string; CreatedDate: string }) => ({
        blogId: comment.BlogNewsId,
        blogCommentId: comment.BlogNewsCommentId,
        blogComment: comment.BlogComment,
        createdDate: comment.CreatedDate ? String(comment.CreatedDate) : " ",
      })) || [];

    return commentList;
  } catch (error) {
    logServer.error(AREA.BLOG_NEWS, errorStack(error));
    return [];
  }
}

/**
 * Saves comments against a blog/news.
 * @param model - The comment data to be saved.
 * @returns A promise that resolves to the saved comment data.
 */
export async function saveComments(comment: IAddBlogComment): Promise<IBlogComment | null> {
  try {
    const commentDetail: any = await WebStoreBlogNews_comment(comment.blogNewsCode, {
      LocaleCode: comment.localeCode,
      BlogComment: comment.blogComment,
    });
    const commentDetails: IBlogComment = {
      blogId: commentDetail?.BlogNewsId,
      blogCommentId: commentDetail?.BlogNewsCommentId,
      blogComment: commentDetail?.BlogComment,
      createdDate: commentDetail?.CreatedDate,
      blogNewsCode: commentDetail?.BlogNewsCode,
    };

    return commentDetails;
  } catch (error) {
    logServer.error(AREA.BLOG_NEWS, errorStack(error));
    return null;
  }
}
