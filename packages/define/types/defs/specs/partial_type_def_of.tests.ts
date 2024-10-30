import { type SimplifyDeep } from 'type-fest'
import { type TypeDefType } from 'types/defs'
import {
  list,
  map,
  number,
  string,
  struct,
  union,
} from 'types/defs/builders'
import { type PartialTypeDefOf } from 'types/defs/partial_type_def_of'

describe('PartialTypeDefOf', function () {
  describe('literal', function () {
    type T = PartialTypeDefOf<typeof number>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: null,
          },
          readonly [1]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: number,
          },
        },
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('list', function () {
    const builder = list(number)
    type T = PartialTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: null,
          },
          readonly [1]: {
            readonly type: TypeDefType.List,
            readonly elements: {
              readonly type: TypeDefType.Union,
              readonly discriminator: null,
              readonly unions: {
                readonly [0]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: null,
                },
                readonly [1]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: number,
                },
              },
            },
            readonly readonly: false,
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('map', function () {
    const builder = map<'a' | 'b', typeof number>(number)
    type T = SimplifyDeep<PartialTypeDefOf<typeof builder>>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: null,
          },
          readonly [1]: {
            readonly type: TypeDefType.Map,
            readonly keyPrototype: 'a' | 'b',
            readonly valueTypeDef: {
              readonly type: TypeDefType.Union,
              readonly discriminator: null,
              readonly unions: {
                readonly [0]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: null,
                },
                readonly [1]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: number,
                },
              },
            } | undefined,
            readonly readonly: false,
          },
        },
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('struct', function () {
    const builder = struct()
      .set('a', number)
      .setReadonly('b', string)
    type T = PartialTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: null,
          },
          readonly [1]: {
            readonly type: TypeDefType.Structured,
            readonly fields: {
              a?: {
                readonly type: TypeDefType.Union,
                readonly discriminator: null,
                readonly unions: {
                  readonly [0]: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: null,
                  },
                  readonly [1]: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: number,
                  },
                },
              },
              readonly b?: {
                readonly type: TypeDefType.Union,
                readonly discriminator: null,
                readonly unions: {
                  readonly [0]: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: null,
                  },
                  readonly [1]: {
                    readonly type: TypeDefType.Literal,
                    readonly valuePrototype: string,
                  },
                },
              },
            },
          },
        },
      },
    }

    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })

  describe('union', function () {
    describe('simple', function () {
      const builder = union()
        .add(1, number)
        .add(2, string)
      type T = PartialTypeDefOf<typeof builder>

      let t: {
        readonly typeDef: {
          readonly type: TypeDefType.Union,
          readonly discriminator: null,
          readonly unions: {
            readonly [0]: {
              readonly type: TypeDefType.Literal,
              readonly valuePrototype: null,
            },
            readonly [1]: {
              readonly type: TypeDefType.Union,
              readonly discriminator: null,
              readonly unions: {
                readonly [1]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: number,
                },
                readonly [2]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: string,
                },
              },
            },
          },
        },
      }

      it('equals expected type', function () {
        expectTypeOf(t).toEqualTypeOf<T>()
      })
    })
  })

  describe('readonly', function () {
    const builder = list(number).readonly()
    type T = PartialTypeDefOf<typeof builder>

    let t: {
      readonly typeDef: {
        readonly type: TypeDefType.Union,
        readonly discriminator: null,
        readonly unions: {
          readonly [0]: {
            readonly type: TypeDefType.Literal,
            readonly valuePrototype: null,
          },
          readonly [1]: {
            readonly type: TypeDefType.List,
            readonly elements: {
              readonly type: TypeDefType.Union,
              readonly discriminator: null,
              readonly unions: {
                readonly [0]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: null,
                },
                readonly [1]: {
                  readonly type: TypeDefType.Literal,
                  readonly valuePrototype: number,
                },
              },
            },
            readonly readonly: true,
          },
        },
      },
    }
    it('equals expected type', function () {
      expectTypeOf(t).toEqualTypeOf<T>()
    })
  })
})
