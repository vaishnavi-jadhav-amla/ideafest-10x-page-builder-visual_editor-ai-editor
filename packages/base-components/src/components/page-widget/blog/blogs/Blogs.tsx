import { BreadCrumbs } from "../../../common/breadcrumb";
import { CustomImage } from "../../../common/image";
import { Heading } from "../../../common/heading";
import { HeadingBar } from "../../../common/heading-bar/HeadingBar";
import Link from "next/link";
import { NoRecordFound } from "../../../common/no-record-found";
import { SETTINGS } from "@znode/constants/settings";
import { ZIcons } from "../../../common/icons";
import { useTranslationMessages } from "@znode/utils/component";
import { useTranslations } from "next-intl";

interface IBlog {
  blogId: string;
  mediaPath: string;
  mediaId: number;
  blogTitle: string;
  createdDate?: string;
  blogNewsCode?: string;
  seoUrl?: string;
}

interface IBlogsProps {
  blogs: IBlog[];
}

export function Blog(props: Readonly<IBlogsProps>) {
  const { blogs } = props || {}; // ** NOTE handle falsy values
  const blogMessage = useTranslations("Blog");
  const commonTranslations = useTranslationMessages("Common");

  if (!blogs.length) {
    return <NoRecordFound text={commonTranslations("noRecordsFound")} customClass="my-20" />;
  }

  return (
    <div data-test-selector="divBlogsContainer">
      <BreadCrumbs breadCrumbsTitle={blogMessage("blogs")} enablePageContextBreadcrumb={true} />
      {/* Heading */}
      <HeadingBar name={blogMessage("blogs")} />

      {/* Blog List */}
      <div className="container py-8 mx-auto" data-test-selector="divBlogListContainer">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 auto-rows-1fr ">
          {blogs?.map((item, key: number) => {
            const { blogId, blogTitle, mediaPath, createdDate, blogNewsCode, seoUrl } = item || {};
            const blogUrl = seoUrl ? "/" + seoUrl : `/blog/${blogNewsCode}`;
            return (
              <Link href={blogUrl} className="bg-white rounded-sm shadow-lg hover:shadow-2xl" data-test-selector={`linkBlog${blogId}`} key={key + String(blogNewsCode)}>
                <div>
                  <CustomImage src={mediaPath} alt={`${blogNewsCode}`} width={0} className="object-cover w-full h-40 rounded-sm" dataTestSelector={`imgBlog${blogId}`} />
                  <div className="flex items-center justify-between px-4 py-2">
                    <div>
                      <Heading name={blogTitle} level="h2" customClass="ellipsis-text pb-1" dataTestSelector={`hdgBlogTitle${blogId}`} />
                      <p className="text-xs" data-test-selector={`paraBlogDate${blogId}`}>
                        {createdDate}
                      </p>
                    </div>
                    <div className="mb-2">
                      <ZIcons name="chevron-right" color={`${SETTINGS.ARROW_COLOR}`} data-test-selector={`svgChevronRight${blogId}`} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
