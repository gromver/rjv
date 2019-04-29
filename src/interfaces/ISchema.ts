export default interface ISchema {
  title?: string;
  description?: string;
  default?: any;
  filter?: (value: any) => any;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: any[];
  error?: any;
  warning?: any;
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
}
