import FieldType from '../FieldType';

export interface ColumnTypes {
  [columnName: string]: FieldType;
}

export interface CreateTable {
  type: 'createTable';
  name: string;
  options: any;
  fields: ColumnTypes;
}

export interface DropTable {
  type: 'dropTable';
  name: string;
  options?: any;
  fields?: ColumnTypes;
}

export type Operation = CreateTable | DropTable;
