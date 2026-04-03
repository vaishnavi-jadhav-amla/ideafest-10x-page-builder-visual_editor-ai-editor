import { VIDEO_ID_REGEX } from "@znode/constants/regex";

const createThumbnailGetter = (regex: RegExp, thumbnailUrl: (_id: string) => string) => {
  return (url: string): string | null => {
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    return videoId ? thumbnailUrl(videoId) : null;
  };
};

export const getYouTubeThumbnail = createThumbnailGetter(VIDEO_ID_REGEX.YOUTUBE, (videoId) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);

export const getDailymotionThumbnail = createThumbnailGetter(VIDEO_ID_REGEX.DAILYMOTION, (videoId) => `https://www.dailymotion.com/thumbnail/video/${videoId}`);

export const getVimeoThumbnail = createThumbnailGetter(VIDEO_ID_REGEX.VIMEO, (videoId) => `https://vumbnail.com/${videoId}.jpg`);

export const getGoogleDriveThumbnail = createThumbnailGetter(VIDEO_ID_REGEX.GOOGLE_DRIVE, (fileId) => `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${fileId}`);
