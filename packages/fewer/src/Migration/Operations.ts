import ColumnType from '../ColumnType';

export interface ColumnTypes {
  [columnName: string]: ColumnType;
}

export interface CreateTable {
  type: 'createTable';
  name: string;
  options: any;
  columns: ColumnTypes;
}

export interface DropTable {
  type: 'dropTable';
  name: string;
  options?: any;
  columns?: ColumnTypes;
}

export type Operation = CreateTable | DropTable;
