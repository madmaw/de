import '@mantine/core/styles.css'

import {
  Box,
  createTheme,
  MantineProvider,
} from '@mantine/core'
import { assertExistsAndReturn } from '@strictly/base'
import { AssistedPetEditor } from 'features/form/pet/assisted/assisted_pet_editor'
import { type Pet } from 'features/form/pet/types'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

window.onload = function () {
  const elementId = 'root'
  const e = assertExistsAndReturn(
    document.getElementById(elementId),
    'unable to find element id {}',
    elementId,
  )
  const theme = createTheme({
    /** Put your mantine theme override here */
  })

  const value: Pet = {
    name: 'Delta',
    alive: true,
    tags: [
      'cute',
      'black',
      'nervous',
      'clever',
    ],
    species: {
      type: 'cat',
      meows: 1000,
    },
  }

  function onValueChange(value: Pet) {
    // eslint-disable-next-line no-console
    console.log(value)
  }

  createRoot(e).render(
    (
      <StrictMode>
        <MantineProvider theme={theme}>
          <Box m='md'>
            <AssistedPetEditor
              onValueChange={onValueChange}
              value={value}
            />
          </Box>
        </MantineProvider>
      </StrictMode>
    ),
  )
}
