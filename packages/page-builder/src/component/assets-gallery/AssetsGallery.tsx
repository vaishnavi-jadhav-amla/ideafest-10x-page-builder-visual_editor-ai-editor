"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { CustomImage } from "@znode/base-components/common/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoaderComponent } from "@znode/base-components/common/loader-component";
import { MEDIA } from "@znode/constants/images";
import { NoRecordFound } from "@znode/base-components/common/no-record-found";
import { PAGINATION } from "@znode/constants/pagination";
import { Video } from "@znode/base-components/znode-widget/video";
import { debounce } from "lodash";
import { getAssetGalleryImages } from "@znode/base-components/http-request";
import { useTranslationMessages } from "@znode/utils/component";

interface IGalleryImages {
  mediaServerPath: string;
  fileName: string;
}

interface IAssetsGalleryProps {
  mediaType: string;
  onChangeImage: (url: string) => void;
}

export function AssetsGallery({ mediaType, onChangeImage }: Readonly<IAssetsGalleryProps>) {
  const [galleryImages, setGalleryImages] = useState<IGalleryImages[]>([]);
  const [searchImage, setSearchImage] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(PAGINATION.DEFAULT_TABLE_PAGE_INDEX);
  const [pageSize] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const commonMessage = useTranslationMessages("Common");

  useEffect(() => {
    getImgs();
  }, [pageIndex]);

  const getImgs = async (pageNumber?: number) => {
    setLoading(true);
    setHasMore(true);
    const response = await getAssetGalleryImages({ pageIndex: pageNumber || pageIndex, pageSize, mediaType, query: searchImage });
    if (!response) {
      return null;
    }
    const galleryData = response?.imagesData || [];
    const totalResult = response?.totalResults;

    if (galleryData.length > 0) {
      if (galleryImages.length + galleryData.length < totalResult) setHasMore(true);
      else setHasMore(false);
      setGalleryImages((prevImages) => [...(pageNumber != 1 ? prevImages : []), ...galleryData]);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getImgs(PAGINATION.DEFAULT_TABLE_PAGE_INDEX);
  }, [searchImage]);

  const handleSearch = debounce((query: string) => {
    setSearchImage(query);
    setGalleryImages([]);
  }, 1000);

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearch(e?.target?.value);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-1">
      <input
        type="text"
        placeholder="Search"
        onChange={handleSearchInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="w-full p-1 px-3 border border-gray-300 rounded shadow-sm text-sm "
      />
      <div id="scrollableDiv" className="shadow-lg custom-scroll h-[300px] w-full mt-2.5 bg-white rounded-md overflow-auto relative">
        <InfiniteScroll
          dataLength={galleryImages?.length}
          next={() => setPageIndex((prevPage) => prevPage + 1)}
          hasMore={hasMore}
          loader={loading && <div className="mt-5"><LoaderComponent isLoading={loading} /></div>}
          scrollableTarget="scrollableDiv"
        >
          {galleryImages && galleryImages?.length ? (
            <div className="grid gap-4 mb-3 cursor-pointer xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages?.map((image: IGalleryImages, index) => (
                <div key={index} className="relative flex flex-col overflow-hidden rounded-md shadow-md h-30" onClick={() => onChangeImage(image?.mediaServerPath)}>
                  {MEDIA.VIDEO_EXTENSION.includes(mediaType) ? (
                    <Video videoUrl={image?.mediaServerPath} controlEnable={false} autoPlay={false} muted={true} />
                  ) : (
                    <CustomImage
                      src={image?.mediaServerPath}
                      alt={image?.fileName}
                      width={500}
                      height={300}
                      className="object-cover h-auto max-w-full"
                      dataTestSelector={`img${index}`}
                    />
                  )}
                  <div>
                    <h3 className="my-2 text-center">
                      {image?.fileName?.split(".")[0].length > 15 ? image?.fileName?.split(".")[0].substring(0, 15) + "..." : image?.fileName?.split(".")[0]}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading ? (
            <NoRecordFound text={`${commonMessage("noRecordsFound")}`} customClass="my-2" />
          ) : (
            <></>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
}
