"use client";

import "./BlogStyles.scss";

import { BlogComments } from "./blog-comments/BlogComments";
import Button from "../../../common/button/Button";
import { CustomImage } from "../../../common/image";
import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface IBlogDetailsProps extends PropsWithChildren {
  mediaPath: string;
  imageAlt: string;
  title: string;
  body: string;
  blogId: number;
  createdDate: string;
  allowGuestComment: boolean;
  blogNewsCode: string;
  tags: string;
}

export function BlogDetails(props: Readonly<IBlogDetailsProps>) {
  const blogMessage = useTranslations("Blog");
  const router = useRouter();

  const { title, body, mediaPath, createdDate, allowGuestComment, blogId, blogNewsCode, tags } = props || {};
  return (
    <div data-test-selector={`divBlogContainer${blogId}`}>
      <div className="relative px-4 sm:px-8 md:px-16" data-test-selector={`divBlogImageContainer${blogId}`}>
        <CustomImage src={mediaPath} alt="dummy img" className="object-cover w-full h-48 sm:h-64 md:h-96" dataTestSelector={`imgBlog${blogId}`} />
      </div>
      <div className="relative p-4 mx-auto md:mx-8 lg:mx-16 xl:mx-48 md:-mt-32 lg:-mt-40">
        <div className="z-50 px-4 py-4 bg-white shadow-md md:py-8 sm:px-8 md:px-20">
          <div className="mb-4">
            <Button
              type="secondary"
              size="small"
              className="px-5 mb-2 md:float-right md:mt-1 md:ml-3 md:mb-0"
              onClick={() => {
                router.push("/blog/list");
              }}
              dataTestSelector="btnBlogBack"
              ariaLabel="back to blog list button"
            >
              {blogMessage("back")}
            </Button>
            <h1 className="text-2xl font-bold md:hyphens-auto sm:text-3xl lg:text-4xl" data-test-selector={`hdgBlogTitle${blogId}`}>
              {title}
            </h1>
            <h5 className="mt-2" data-test-selector={`paraBlogDate${blogId}`}>
              {createdDate}
            </h5>
          </div>
          <div className="remove-default-styles">
            <div dangerouslySetInnerHTML={{ __html: body || "" }} data-test-selector={`divBlogDetails${blogId}`}></div>
          </div>
          {tags && (
            <div className="mt-2" data-test-selector={`divBlogTags${blogId}`}>
              <span className="font-bold">{blogMessage("tags")}: </span>
              {tags}
            </div>
          )}
          {
            // TODO: v2 API: Pass blogId strings because the API now requires blogId to be passed as strings.
            allowGuestComment && <BlogComments blogId={String(blogId)} blogNewsCode={blogNewsCode} />
          }
        </div>
      </div>
    </div>
  );
}
