import { toArray } from '@de/base'
import { composeStories } from '@storybook/react'
import {
  render,
} from '@testing-library/react'
import * as stories from './pet_species_dog_form.stories'

// example of importing a story as a test component
const composedStories = composeStories(stories)

describe('PetSpeciesDogForm', function () {
  it.each(toArray(composedStories))('renders %s', function (_name, Story) {
    const wrapper = render(<Story />)
    expect(wrapper.container).toMatchSnapshot()
  })
})