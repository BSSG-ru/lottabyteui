type DomainDataItem = {
  code: number | null;
  name: string | null;
  description: string | null;
  createAt: string | null;
  responsible: string | null;
  is_in_fav: boolean | null | undefined;
};

export enum Direction {
  Ascending = 'asc',
  Descending = 'desc',
}

export type DataItem = DomainDataItem;
export type DataItemVoid = DataItem | void;
