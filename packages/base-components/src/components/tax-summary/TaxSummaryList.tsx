import { ITaxSummary } from "@znode/types/account";
import { formatTestSelector } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";

const TaxSummaryList = ({ taxSummaryList, taxMessageList }: { taxSummaryList: ITaxSummary[]; taxMessageList?: string[] }) => {
  const commonTranslations = useTranslationMessages("Common");

  return (
    <>
      <table className="table-auto border border-separatorColor bg-white shadow-md w-full" data-test-selector="tblTaxSummary" role="table" aria-label="Tax Summary Table">
        <thead className="bg-gray-100">
          <tr data-test-selector="rowTaxTableHeading">
            <th scope="col" className="px-4 py-2 text-left" data-test-selector="colTaxNameHeading">
              {commonTranslations("taxName")}
            </th>
            <th scope="col" className="px-4 py-2 text-left" data-test-selector="colRateHeading">
              {commonTranslations("rate")}
            </th>
            <th scope="col" className="px-4 py-2 text-right" data-test-selector="colTaxesHeading">
              {commonTranslations("taxesFees")}
            </th>
          </tr>
        </thead>
        <tbody>
          {taxSummaryList?.map((taxSummary: ITaxSummary, i: number) => (
            <tr data-test-selector={formatTestSelector("row", taxSummary.taxName)} key={i}>
              <td className="px-4 py-2 border border-gray-300" data-test-selector={formatTestSelector("col", taxSummary.taxName)}>
                {taxSummary.taxName}
              </td>
              <td className="px-4 py-2 border border-gray-300" data-test-selector={formatTestSelector("colRate", taxSummary.taxName)}>
                {taxSummary.rate}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right" data-test-selector={formatTestSelector("colTax", taxSummary.taxName)}>
                {taxSummary.tax}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {taxMessageList && taxMessageList.length > 0 && (
        <ul className="list-disc pl-3 ml-3 text-xs mt-2">
          {taxMessageList.map((taxMessage: string) => {
            return <li className="pb-1">{taxMessage}</li>;
          })}
        </ul>
      )}
    </>
  );
};

export default TaxSummaryList;
