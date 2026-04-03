interface IPersonalizedData {
  personalizeName?: string;
  personalizeValue?: string;
}

interface IPersonalizedParams {
  data: Array<IPersonalizedData>;
}

const RenderPersonalizedItems = ({ data }: IPersonalizedParams) => {
  if (!data || data.length === 0) {
    return <></>;
  }
  const PersonalizeList = data.map((val: IPersonalizedData, index: number) => {
    return (
      <div className="flex gap-2  items-centre" key={`${val?.personalizeName}_${index}`} data-test-selector="divPersonalizationText">
        <p data-test-selector="paraPersonalizationText">
          {val?.personalizeName} : {val?.personalizeValue}
        </p>
      </div>
    );
  });
  return PersonalizeList;
};
export default RenderPersonalizedItems;
