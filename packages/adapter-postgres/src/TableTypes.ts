export default interface TableTypes {
  // Leading table modifiers:
  temporary?: boolean;
  ifNotExists?: boolean;
  unlogged?: boolean;
  // Tailing table modifiers:
  inherits?: string[];
  onCommit?: 'PRESERVE ROWS' | 'DELETE ROWS' | 'DROP';
  tablespace?: string;
  primaryKey?: (string | string[])[];
}
