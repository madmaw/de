import { action } from '@storybook/addon-actions'
import {
  type Meta,
  type StoryObj,
} from '@storybook/react'
import { PetSpeciesCatForm } from 'features/form/pet/pet_species_cat_form'

const Component = PetSpeciesCatForm

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onFieldBlur: action('onFieldBlur'),
    onFieldFocus: action('onFieldFocus'),
    onFieldValueChange: action('onFieldValueChange'),
    onFieldSubmit: action('onFieldSubmit'),
  },
}

export default meta

type Story = StoryObj<typeof Component>

export const Valid: Story = {
  args: {
    fields: {
      '$.species.cat:meows': {
        disabled: false,
        value: 1,
        required: true,
      },
    },
  },
}
