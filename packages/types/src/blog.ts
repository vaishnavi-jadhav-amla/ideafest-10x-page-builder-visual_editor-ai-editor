export interface IBlogBase {
  blogId: number;
  mediaPath: string;
  createdDate: string;
  blogNewsCode: string;
}

export interface IBlog extends IBlogBase {
  mediaId: string;
  blogTitle: string;
}

export interface IBlogDetails extends IBlogBase {
  body: string;
  allowGuestComment: string;
  title: string;
  tags: string;
}

export interface IBlogComment extends Omit<IBlogBase, "mediaPath"> {
  blogCommentId: number;
  blogComment: string;
}

export interface IAddBlogComment {
  blogComment: string;
  localeCode: string;
  blogNewsCode: string;
}
