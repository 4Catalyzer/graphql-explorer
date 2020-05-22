import 'yup';

declare module 'yup' {
  export interface ObjectSchema<
    T extends Record<string, any> | null | undefined = Record<string, any>
  > {
    fields: { [K in keyof T]: Schema<T[K]> };
  }
}
