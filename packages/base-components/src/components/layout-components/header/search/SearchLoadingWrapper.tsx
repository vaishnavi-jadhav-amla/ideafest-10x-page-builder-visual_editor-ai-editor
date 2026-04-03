import { LoadingSpinner } from "../../../common/icons";

export function SearchLoadingWrapper() {
  return (
    <div className="absolute top-1/2 transform -translate-y-1/2 xs:pb-4 xs:p-2 mt-0.5">
      <LoadingSpinner width="30px" height="30px" viewBox="0 0 130 80" />
    </div>
  );
}
