import { valuePathToTypePath } from 'transformers/flatteners/value_path_to_type_path'
import {
  boolean,
  list,
  map,
  number,
  string,
  struct,
  union,
} from 'types/builders'
import { type ValueToTypePathsOf } from 'types/value_to_type_paths_of'

describe('valuePathToTypePath', function () {
  describe('literal', function () {
    const typeDef = number
    type JsonPaths = ValueToTypePathsOf<typeof typeDef>

    const typePath = valuePathToTypePath<JsonPaths, '$'>(typeDef, '$')

    it('maps a value path to the expected type path', function () {
      expect(typePath).toEqual('$')
    })

    it('has expected type', function () {
      expectTypeOf(typePath).toEqualTypeOf<'$'>()
    })

    describe('fake subpath', function () {
      const fakeTypePath = valuePathToTypePath<{
        '$.fake': '$.fake',
      }, '$.fake'>(typeDef, '$.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
      })
    })
  })

  describe('list', function () {
    const typeDef = list(number)
    type JsonPaths = ValueToTypePathsOf<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$.0',
        '$.*',
      ],
    ] as const)('it maps "%s"', function (from, to) {
      const typePath = valuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake subpath', function () {
      const fakeTypePath = valuePathToTypePath<
        JsonPaths & {
          [_: `$.${number}.fake`]: '$.*.fake',
        },
        '$.0.fake'
      >(typeDef, '$.0.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.*.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.*.fake'>()
      })
    })
  })

  describe('map', function () {
    type Key = 'a' | 'b'
    const typeDef = map<typeof number, Key>(number)
    type JsonPaths = ValueToTypePathsOf<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$.a',
        '$.*',
      ],
      [
        '$.b',
        '$.*',
      ],
    ] as const)('it maps "%s"', function (from, to) {
      const typePath = valuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake subpath', function () {
      const fakeTypePath = valuePathToTypePath<
        JsonPaths & {
          '$.a.fake': '$.*.fake',
          '$.b.fake': '$.*.fake',
        },
        '$.a.fake'
      >(typeDef, '$.a.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.*.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.*.fake'>()
      })
    })
  })

  describe('struct', function () {
    const typeDef = struct().set('a', number).set('b', boolean)
    type JsonPaths = ValueToTypePathsOf<typeof typeDef>

    describe.each([
      [
        '$',
        '$',
      ],
      [
        '$.a',
        '$.a',
      ],
      [
        '$.b',
        '$.b',
      ],
    ] as const)('it maps %s', function (from, to) {
      const typePath = valuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

      it('maps a value path to the expected type path', function () {
        expect(typePath).toEqual(to)
      })

      it('has expected type', function () {
        expectTypeOf(typePath).toEqualTypeOf(to)
      })
    })

    describe('fake field', function () {
      const fakeTypePath = valuePathToTypePath<
        JsonPaths & {
          '$.fake': '$.fake',
        },
        '$.fake'
      >(typeDef, '$.fake', true)

      it('maps a value path to the expected type path', function () {
        expect(fakeTypePath).toEqual('$.fake')
      })

      it('has expected type', function () {
        expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
      })
    })
  })

  describe('union', function () {
    describe('discriminated', function () {
      const typeDef = union('w')
        .add('x', struct().set('a', number).set('b', boolean))
        .add('y', struct().set('b', string).set('c', boolean))
      type JsonPaths = ValueToTypePathsOf<typeof typeDef>

      describe.each([
        [
          '$',
          '$',
        ],
        [
          '$.x:a',
          '$.x:a',
        ],
        [
          '$.x:b',
          '$.x:b',
        ],
        [
          '$.y:b',
          '$.y:b',
        ],
        [
          '$.y:c',
          '$.y:c',
        ],
      ] as const)('it maps %s', function (from, to) {
        const typePath = valuePathToTypePath<JsonPaths, typeof from>(typeDef, from)

        it('maps a value path to the expected type path', function () {
          expect(typePath).toEqual(to)
        })

        it('has expected type', function () {
          expectTypeOf(typePath).toEqualTypeOf(to)
        })
      })

      describe('fake', function () {
        const fakeTypePath = valuePathToTypePath<
          JsonPaths & {
            '$.fake': '$.fake',
          },
          '$.fake'
        >(typeDef, '$.fake', true)

        it('maps a value path to the expected type path', function () {
          expect(fakeTypePath).toEqual('$.fake')
        })

        it('has expected type', function () {
          expectTypeOf(fakeTypePath).toEqualTypeOf<'$.fake'>()
        })
      })
    })
  })
})
