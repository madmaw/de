import {
  map,
  reduce,
  UnexpectedImplementationError,
  UnreachableError,
} from '@de/base'
import {
  type StructuredFieldKey,
  type TypeDef,
  TypeDefType,
  type UnionKey,
} from 'types/definitions'
import { type ReadonlyTypeDefOf } from 'types/readonly_type_def_of'
import {
  type StrictListTypeDef,
  type StrictLiteralTypeDef,
  type StrictMapTypeDef,
  type StrictStructuredTypeDef,
  type StrictStructuredTypeDefFields,
  type StrictTypeDef,
  type StrictTypeDefHolder,
  type StrictUnionTypeDef,
} from 'types/strict_definitions'
import { type ValueTypeOf } from 'types/value_type_of'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValueType = any

export type Copier<R> = (v: AnyValueType, t: StrictTypeDef) => R

export function copyTo<
  T extends StrictTypeDefHolder,
  R extends ValueTypeOf<ReadonlyTypeDefOf<T>>,
>(
  { typeDef }: T,
  value: ValueTypeOf<ReadonlyTypeDefOf<T>>,
  copier: Copier<R>,
): R {
  return internalCopyTo(
    typeDef,
    value,
    copier,
  )
}

/**
 * Creates a copy of the supplied value
 * @param def description of the object to create
 * @param value the value to populate the object from
 * @returns a copy of the supplied value
 */
function internalCopyTo<R>(
  typeDef: TypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  switch (typeDef.type) {
    case TypeDefType.Literal:
      return copyLiteral(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.List:
      return copyList(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.Map:
      return copyMap(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.Structured:
      return copyStruct(
        typeDef,
        value,
        copier,
      )
    case TypeDefType.Union:
      return copyUnion(
        typeDef,
        value,
        copier,
      )
    default:
      throw new UnreachableError(typeDef)
  }
}

function copyLiteral<
  R,
>(
  typeDef: StrictLiteralTypeDef,
  value: ValueTypeOf<{ typeDef: StrictLiteralTypeDef }>,
  copier: Copier<R>,
): R {
  // mutable and immutable literals should be the same type
  return copier(value, typeDef)
}

function copyList<
  R,
>(
  typeDef: StrictListTypeDef,
  arr: AnyValueType[],
  copier: Copier<R>,
): R {
  const {
    elements,
  } = typeDef
  const list = arr.map(function (value) {
    return internalCopyTo(elements, value, copier)
  })
  return copier(
    list,
    typeDef,
  )
}

function copyMap<
  R,
>(
  typeDef: StrictMapTypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  const {
    valueTypeDef,
  } = typeDef
  const record = map(
    value,
    function (_key, value) {
      return internalCopyTo(valueTypeDef, value, copier)
    },
  )
  return copier(
    record,
    typeDef,
  )
}

function copyStructFields<
  R,
  Extra extends Record<string, UnionKey>,
>(
  fields: StrictStructuredTypeDefFields,
  value: Record<StructuredFieldKey, AnyValueType>,
  copier: Copier<R>,
  extra: Extra,
): Record<StructuredFieldKey, AnyValueType> {
  const record = reduce(fields, function (acc, key, field: TypeDef) {
    const fieldValue = value[key]
    if (fieldValue != null) {
      acc[key] = internalCopyTo(field, fieldValue, copier)
    }
    return acc
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, extra as Record<string | number | symbol, AnyValueType>)
  return record
}

function copyStruct<
  R,
>(
  typeDef: StrictStructuredTypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  const {
    fields,
  } = typeDef
  const record = copyStructFields(fields, value, copier, {})
  return copier(record, typeDef)
}

function copyUnion<
  R,
>(
  typeDef: StrictUnionTypeDef,
  value: AnyValueType,
  copier: Copier<R>,
): R {
  const {
    discriminator,
    unions,
  } = typeDef

  // is it a discriminated union with a struct?
  if (discriminator != null) {
    const discriminatorValue = value[discriminator]
    const discriminatingUnion = {
      ...internalCopyTo(
        unions[discriminatorValue],
        value,
        copier,
      ),
      [discriminator]: discriminatorValue,
    }
    return copier(discriminatingUnion, typeDef)
  }

  // is it a `<constant1> | <constant2> | X`? We can handle that
  // a good example is when we `| null` something
  const allTypeDefs = Object.values<TypeDef>(unions)
  const variableTypeDefs = allTypeDefs.filter(function (typeDef: TypeDef) {
    return typeDef.type !== TypeDefType.Literal || typeDef.valuePrototype == null
  })
  if (variableTypeDefs.length <= 1) {
    // can handle up to one non-constant value
    const targetTypeDef = allTypeDefs.find(function (typeDef) {
      return typeDef.type === TypeDefType.Literal
        && typeDef.valuePrototype != null
        && typeDef.valuePrototype.indexOf(value) >= 0
    }) || variableTypeDefs[0]
    return internalCopyTo(targetTypeDef, value, copier)
  }

  // oh dear!
  // this should have caused a type error already
  throw new UnexpectedImplementationError(
    'unions must be strict in order to be copied',
  )
}
