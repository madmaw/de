import {
  copy,
  type ReadonlyTypeDefOf,
  type Type,
  type ValueTypeOf,
} from '@de/fine'
import {
  type FieldConversion,
  FieldConversionResult,
  type TwoWayFieldConverterWithValueFactory,
} from 'types/field_converters'

export class NullableToBooleanConverter<
  T extends Type,
  E,
  ValuePath extends string,
  Context,
> implements TwoWayFieldConverterWithValueFactory<
  ValueTypeOf<ReadonlyTypeDefOf<T>> | null,
  boolean,
  E,
  ValuePath,
  Context
> {
  readonly defaultValue: ValueTypeOf<ReadonlyTypeDefOf<T>> | null

  constructor(
    private readonly typeDef: T,
    private readonly prototype: ValueTypeOf<ReadonlyTypeDefOf<T>>,
    defaultToNull = true,
  ) {
    this.defaultValue = defaultToNull ? null : prototype
  }

  convert(from: ValueTypeOf<ReadonlyTypeDefOf<T>> | null): boolean {
    return from != null
  }

  revert(from: boolean): FieldConversion<ValueTypeOf<ReadonlyTypeDefOf<T>> | null, E> {
    if (from) {
      const value: ValueTypeOf<T> = copy(this.typeDef, this.prototype)
      return {
        type: FieldConversionResult.Success,
        value,
      }
    }
    return {
      type: FieldConversionResult.Success,
      value: null,
    }
  }

  create(): ValueTypeOf<ReadonlyTypeDefOf<T>> | null {
    return this.defaultValue
  }
}
