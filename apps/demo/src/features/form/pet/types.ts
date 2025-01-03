import {
  booleanType,
  type FlattenedAccessorsOfType,
  type FlattenedTypesOfType,
  type FlattenedValuesOfType,
  list,
  literal,
  numberType,
  object,
  type PathsOfType,
  type ReadonlyTypeOfType,
  stringType,
  union,
  type ValueOfType,
  type ValueToTypePathsOf,
} from '@strictly/define'

export type DogBreed = 'Alsatian' | 'Pug' | 'other'
export type CatBreed = 'Burmese' | 'Siamese' | 'DSH'

export const dogBreedType = literal<DogBreed | null>()
export const catBreedType = literal<CatBreed | null>()

export const speciesType = union('type')
  .add(
    'dog',
    object()
      .set('barks', numberType)
      .setOptional('breed', dogBreedType),
  )
  .add(
    'cat',
    object()
      .set('meows', numberType)
      .setOptional('breed', catBreedType),
  )

export type Species = keyof typeof speciesType['definition']['unions']

export const petType = object()
  .set('name', stringType)
  .set('alive', booleanType)
  .set('tags', list(stringType))
  .set('species', speciesType)
  .narrow

export type TagValuePath = `$.tags.${number}`

export type MutablePet = ValueOfType<typeof petType>
export type Pet = ValueOfType<ReadonlyTypeOfType<typeof petType>>
export type PetValuePaths = PathsOfType<typeof petType>
export type PetTypePaths = PathsOfType<typeof petType, '*'>
export type FlattenedPetTypeDefs = FlattenedTypesOfType<typeof petType, '*'>
export type PetValueToTypePaths = ValueToTypePathsOf<typeof petType> & {
  '$.newTag': '$.newTag',
}
export type FlattenedPetValueTypes = FlattenedValuesOfType<typeof petType>
export type FlattenedPetAccessors = FlattenedAccessorsOfType<typeof petType>

export const NOT_A_NUMBER_ERROR = 'not a number'
export const NOT_A_BREED_ERROR = 'not a breed'
