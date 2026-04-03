import {IFilterTuple} from "@znode/types/filter";
export class FilterCollection {
  filterTupleArray: IFilterTuple[] = [];

  public add(filterName: string, filterOperator: string, filterValue: string): void {
    this.filterTupleArray.push({
      filterName,
      filterOperator,
      filterValue,
    });
  }
}

export function createFilterTuple(filterName: string, filterOperator: string, filterValue: string): IFilterTuple {
  return { filterName, filterOperator, filterValue };
}
