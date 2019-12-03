import 'yup';

declare module 'yup' {
  export interface ObjectSchema<T extends object | null | undefined = object> {
    fields: { [K in keyof T]: Schema<T[K]> };
  }
}
