export type ItemOf<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ItemType
>
  ? ItemType
  : never;
