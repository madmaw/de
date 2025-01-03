import { type SimplifyDeep } from 'type-fest'
import {
  booleanType,
  numberType,
  object,
  union,
} from 'types/builders'
import { type ValueTypesOfDiscriminatedUnion } from 'types/value_types_of_discriminated_union'

describe('ValueTypesOfDiscriminatedUnion', function () {
  it('matches expected type', function () {
    const { definition } = union('d')
      .add('a', object().set('x', numberType))
      .add('b', object().set('y', booleanType))
    type T = SimplifyDeep<ValueTypesOfDiscriminatedUnion<
      typeof definition
    >>

    expectTypeOf<T>().toEqualTypeOf<{
      readonly a: {
        d: 'a',
        x: number,
      },
      readonly b: {
        d: 'b',
        y: boolean,
      },
    }>()
  })
})
