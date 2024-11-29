import { expectDefinedAndReturn } from '@de/base/test'
import {
  boolean,
  type FlattenedJsonValueToTypePathsOf,
  type FlattenedValueTypesOf,
  list,
  map,
  nullTypeDefHolder,
  number,
  string,
  struct,
  union,
  type ValueTypeOf,
} from '@de/fine'
import { NullableToBooleanConverter } from 'field_converters/nullable_to_boolean_converter'
import { StringToIntegerConverter } from 'field_converters/string_to_integer_converter'
import { type FieldAdapter } from 'react/mobx/field_adapter'
import {
  adapterFromConverter,
  adapterFromPrototype,
  identityAdapter,
} from 'react/mobx/field_adapter_builder'
import {
  type FlattenedTypePathsToAdaptersOf,
  FormModel,
  FormPresenter,
  type ValuePathsToAdaptersOf,
} from 'react/mobx/form_presenter'
import { type Field } from 'types/field'
import { type FieldConverter } from 'types/field_converter'
import { type FieldValueFactory } from 'types/field_value_factory'
import { type Mocked } from 'vitest'
import {
  mock,
  mockClear,
} from 'vitest-mock-extended'

const IS_NAN_ERROR = 1

function createMockedAdapter<
  E,
  To,
  From,
>({
  converter,
  valueFactory,
}: FieldAdapter<E, Record<string, Field>, To, From>): Mocked<
  FieldAdapter<E, Record<string, Field>, To, From>
> {
  const mockedConverter = mock<FieldConverter<E, Record<string, Field>, To, From>>()
  mockedConverter.convert.mockImplementation(converter.convert.bind(converter))
  mockedConverter.revert.mockImplementation(converter.revert.bind(converter))

  const mockedValueFactory = mock<FieldValueFactory<Record<string, Field>, To>>()
  mockedValueFactory.create.mockImplementation(valueFactory.create.bind(valueFactory))

  return {
    converter: mockedConverter,
    valueFactory: mockedValueFactory,
  }
}

describe('all', function () {
  const stringToIntegerAdapter = createMockedAdapter(
    adapterFromPrototype(new StringToIntegerConverter(IS_NAN_ERROR), 0),
  )
  const booleanToBooleanAdapter = createMockedAdapter(
    identityAdapter(false),
  )

  beforeEach(function () {
    mockClear(stringToIntegerAdapter.converter)
    mockClear(stringToIntegerAdapter.valueFactory)
    mockClear(booleanToBooleanAdapter.converter)
    mockClear(booleanToBooleanAdapter.valueFactory)
  })

  describe('FlattenedTypePathsToConvertersOf', function () {
    describe('map', function () {
      const typeDef = map<typeof number, 'a' | 'b'>(number)
      type T = FlattenedTypePathsToAdaptersOf<
        FlattenedValueTypesOf<typeof typeDef>
      >
      let t: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly $?: FieldAdapter<any, Readonly<Record<string, Field>>, Record<'a' | 'b', number>, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.a']?: FieldAdapter<any, Readonly<Record<string, Field>>, number, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.b']?: FieldAdapter<any, Readonly<Record<string, Field>>, number, any>,
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })

    describe('struct', function () {
      const typeDef = struct()
        .set('x', string)
        .set('y', boolean)
      type T = FlattenedTypePathsToAdaptersOf<
        FlattenedValueTypesOf<typeof typeDef>
      >
      let t: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly $?: FieldAdapter<any, Readonly<Record<string, Field>>, { x: string, y: boolean }, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.x']?: FieldAdapter<any, Readonly<Record<string, Field>>, string, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly ['$.y']?: FieldAdapter<any, Readonly<Record<string, Field>>, boolean, any>,
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })

      it('matches representative adapters', function () {
        type A = {
          '$.x': FieldAdapter<string, Record<string, Field>, string>,
          '$.y': FieldAdapter<string, Record<string, Field>, boolean>,
        }
        expectTypeOf<A>().toMatchTypeOf<T>()
      })

      it('does not allow mismatched adapters', function () {
        type A = {
          '$.x': FieldAdapter<string, Record<string, Field>, boolean>,
          '$.y': FieldAdapter<string, Record<string, Field>, string>,
        }
        expectTypeOf<A>().not.toMatchTypeOf<T>()
      })
    })
  })

  describe('ValuePathsToAdaptersOf', function () {
    describe('superset', function () {
      type A = {
        '$.x': FieldAdapter<string, Record<string, Field>, number, string>,
        '$.y': FieldAdapter<string, Record<string, Field>, boolean, boolean>,
      }
      const jsonPaths = {
        $: '$',
        '$.a': '$.x',
        '$.b': '$.y',
        '$.c': '$.z',
      } as const
      type T = ValuePathsToAdaptersOf<
        A,
        typeof jsonPaths
      >
      let t: {
        readonly '$.a': A['$.x'],
        readonly '$.b': A['$.y'],
      }
      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('FormModel', function () {
    describe('literal', function () {
      const typeDef = number
      const adapters = {
        $: stringToIntegerAdapter,
      } as const
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof adapters
      >
      beforeEach(function () {
        originalValue = 5
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof adapters
        >(
          typeDef,
          originalValue,
          adapters,
        )
      })

      describe('accessors', function () {
        it('gets the expected value', function () {
          const accessor = expectDefinedAndReturn(model.accessors.$)
          expect(accessor.value).toEqual(originalValue)
        })

        it('sets the underlying value', function () {
          const newValue = 1
          const accessor = expectDefinedAndReturn(model.accessors.$)
          accessor.set(newValue)
          expect(model.value).toEqual(newValue)
        })
      })

      describe('fields', function () {
        it('equals expected value', function () {
          expect(model.fields).toEqual(
            expect.objectContaining({
              $: expect.objectContaining({
                value: '5',
              }),
            }),
          )
        })

        it('has the expected keys', function () {
          expect(Object.keys(model.fields)).toEqual(['$'])
        })
      })

      describe('jsonPaths', function () {
        it('equals expected value', function () {
          expect(model.jsonPaths).toEqual({
            $: '$',
          })
        })
      })
    })

    describe('list', function () {
      const typeDef = list(number)
      const adapters = {
        '$.*': stringToIntegerAdapter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof adapters
      >
      beforeEach(function () {
        value = [
          1,
          4,
          17,
        ]
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof adapters
        >(
          typeDef,
          value,
          adapters,
        )
      })

      describe('accessors', function () {
        it.each([
          [
            '$[0]',
            1,
          ],
          [
            '$[1]',
            4,
          ],
          [
            '$[2]',
            17,
          ],
        ] as const)('gets the expected values for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$[0]'])
          accessor.set(100)
          expect(model.value).toEqual([
            100,
            4,
            17,
          ])
        })
      })
    })

    describe('map', function () {
      const typeDef = map<typeof number, 'a' | 'b'>(number)
      const converters = {
        '$.*': stringToIntegerAdapter,
        // '$.*': booleanToBooleanConverter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = {
          a: 1,
          b: 2,
        }
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
        )
      })

      describe('accessors', function () {
        it.each([
          [
            '$.a',
            1,
          ],
          [
            '$.b',
            2,
          ],
        ] as const)('gets the expected value for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$.b'])
          const newValue = 100
          accessor.set(newValue)

          expect(model.value.b).toEqual(newValue)
        })
      })

      describe('fields', function () {
        it('equals expected value', function () {
          expect(model.fields).toEqual(
            expect.objectContaining({
              '$.a': expect.objectContaining({
                value: '1',
              }),
              '$.b': expect.objectContaining({
                value: '2',
              }),
            }),
          )
        })
      })

      describe('jsonPaths', function () {
        it('equals expected value', function () {
          expect(model.jsonPaths).toEqual({
            $: '$',
            '$.a': '$.*',
            '$.b': '$.*',
          })
        })
      })
    })

    describe('struct', function () {
      const typeDef = struct()
        .set('a', number)
        .set('b', boolean)
      const converters = {
        '$.a': stringToIntegerAdapter,
        '$.b': booleanToBooleanAdapter,
      } as const
      let value: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        value = {
          a: 1,
          b: true,
        }
        model = new FormModel<
          typeof typeDef,
          FlattenedJsonValueToTypePathsOf<typeof typeDef>,
          typeof converters
        >(
          typeDef,
          value,
          converters,
        )
      })

      describe('accessors', function () {
        it.each([
          [
            '$.a',
            1,
          ],
          [
            '$.b',
            true,
          ],
        ] as const)('gets the expected value for %s', function (valuePath, value) {
          const accessor = expectDefinedAndReturn(model.accessors[valuePath])
          expect(accessor.value).toEqual(value)
        })

        it('sets a value', function () {
          const accessor = expectDefinedAndReturn(model.accessors['$.b'])
          accessor.set(false)
          expect(model.value.b).toEqual(false)
        })
      })

      describe('fields', function () {
        it('equals expected value', function () {
          expect(model.fields).toEqual(
            expect.objectContaining({
              '$.a': expect.objectContaining({
                value: '1',
              }),
              '$.b': expect.objectContaining({
                value: true,
              }),
            }),
          )
        })
      })

      describe('jsonPaths', function () {
        it('equals expected value', function () {
          expect(model.jsonPaths).toEqual({
            $: '$',
            '$.a': '$.a',
            '$.b': '$.b',
          })
        })
      })
    })

    // TODO union
  })

  describe('FormPresenter', function () {
    describe('literal', function () {
      const typeDef = number
      const converters = {
        $: stringToIntegerAdapter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        originalValue = 2
        model = presenter.createModel(originalValue)
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$'>(model, '$', '1')
          })

          it('does not set the underlying value', function () {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the fields', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              $: expect.objectContaining({
                value: '1',
                // eslint-disable-next-line no-undefined
                error: undefined,
              }),
            }))
          })
        })

        describe('failure', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$'>(model, '$', 'x')
          })

          it('does not set the underlying value', function () {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the error state', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              $: expect.objectContaining({
                value: 'x',
                error: IS_NAN_ERROR,
              }),
            }))
          })
        })
      })

      describe.each([
        '1',
        'x',
      ])('setFieldValue to %s', function (newValue) {
        beforeEach(function () {
          presenter.setFieldValue<'$'>(model, '$', newValue)
        })

        it('does not set the underlying value', function () {
          expect(model.value).toEqual(originalValue)
        })

        it('sets the field value', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            $: expect.objectContaining({
              value: newValue,
              // eslint-disable-next-line no-undefined
              error: undefined,
            }),
          }))
        })
      })
    })

    describe('list', function () {
      const typeDef = list(number)
      const converters = {
        '$.*': stringToIntegerAdapter,
      } as const
      const presenter = new FormPresenter<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >(
        typeDef,
        converters,
      )
      let originalValue: ValueTypeOf<typeof typeDef>
      let model: FormModel<
        typeof typeDef,
        FlattenedJsonValueToTypePathsOf<typeof typeDef>,
        typeof converters
      >
      beforeEach(function () {
        originalValue = [
          1,
          3,
          7,
        ]
        model = presenter.createModel(originalValue)
      })

      describe('setFieldValueAndValidate', function () {
        describe('success', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$[0]'>(model, '$[0]', '100')
          })

          it('does not set the underlying value', function () {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the fields', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              '$[0]': expect.objectContaining({
                value: '100',
                // eslint-disable-next-line no-undefined
                error: undefined,
              }),
            }))
          })
        })

        describe('failure', function () {
          beforeEach(function () {
            presenter.setFieldValueAndValidate<'$[0]'>(model, '$[0]', 'x')
          })

          it('does not set the underlying value', function () {
            expect(model.value).toEqual(originalValue)
          })

          it('sets the error state', function () {
            expect(model.fields).toEqual(expect.objectContaining({
              '$[0]': expect.objectContaining({
                value: 'x',
                error: IS_NAN_ERROR,
              }),
            }))
          })
        })
      })

      describe.each([
        '1',
        'x',
      ])('setFieldValue to %s', function (newValue) {
        beforeEach(function () {
          presenter.setFieldValue<'$[0]'>(model, '$[0]', newValue)
        })

        it('does not set the underlying value', function () {
          expect(model.value).toEqual(originalValue)
        })

        it('sets the field value', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$[0]': expect.objectContaining({
              value: newValue,
              // eslint-disable-next-line no-undefined
              error: undefined,
            }),
          }))
        })
      })

      describe('validate', function () {
        beforeEach(function () {
          presenter.setFieldValue<'$[0]'>(model, '$[0]', 'x')
          presenter.setFieldValue<'$[1]'>(model, '$[1]', '2')
          presenter.setFieldValue<'$[2]'>(model, '$[2]', 'z')
          presenter.validateAndMaybeSaveAll(model)
        })

        it('contains errors for all invalid fields', function () {
          expect(model.fields).toEqual(expect.objectContaining({
            '$[0]': expect.objectContaining({
              value: 'x',
              error: IS_NAN_ERROR,
            }),
            '$[1]': expect.objectContaining({
              value: '2',
              // eslint-disable-next-line no-undefined
              error: undefined,
            }),
            '$[2]': expect.objectContaining({
              value: 'z',
              error: IS_NAN_ERROR,
            }),
          }))
        })

        it('sets the value only for valid fields', function () {
          expect(model.value).toEqual([
            1,
            2,
            7,
          ])
        })
      })

      describe('passes context', function () {
        it('supplies the full, previous context when converting', function () {
          presenter.setFieldValueAndValidate<'$[2]'>(model, '$[2]', '4')

          expect(stringToIntegerAdapter.converter.convert).toHaveBeenCalledOnce()
          expect(stringToIntegerAdapter.converter.convert).toHaveBeenCalledWith(
            '4',
            '$[2]',
            expect.objectContaining({
              '$[2]': expect.objectContaining({
                value: '7',
              }),
            }),
          )
        })
      })
    })

    // TODO map / struct

    describe('union', function () {
      describe('non-discriminated', function () {
        const listOfNumbersTypeDef = list(number)
        const typeDef = union()
          .add('null', nullTypeDefHolder)
          .add('0', listOfNumbersTypeDef)
        const adapters = {
          $: adapterFromConverter(new NullableToBooleanConverter<string, typeof typeDef>(typeDef, [1])),
          '$.*': stringToIntegerAdapter,
        } as const
        type JsonPaths = FlattenedJsonValueToTypePathsOf<typeof typeDef>
        const presenter = new FormPresenter<
          typeof typeDef,
          JsonPaths,
          typeof adapters
        >(
          typeDef,
          adapters,
        )
        let originalValue: ValueTypeOf<typeof typeDef>
        let model: FormModel<
          typeof typeDef,
          JsonPaths,
          typeof adapters
        >
        beforeEach(function () {
          originalValue = null
          model = presenter.createModel(originalValue)
        })

        it('has the expected fields', function () {
          expect(model.fields).toEqual({
            $: {
              disabled: false,
              // eslint-disable-next-line no-undefined
              error: undefined,
              value: false,
            },
          })
        })

        describe('setFieldValueAndValidate', function () {
          describe('success', function () {
            beforeEach(function () {
              presenter.setFieldValueAndValidate<'$'>(model, '$', true)
            })

            it('does not set the underlying value', function () {
              expect(model.value).toEqual(originalValue)
            })
          })
        })
      })
    })
  })
})
