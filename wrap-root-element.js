import { AppProvider } from '@shopify/polaris'
import { MDXProvider } from '@mdx-js/tag'
import React from 'react'
import { preToCodeBlock } from 'mdx-utils'
import { StateProvider } from './state'
import { Code } from './src/components/code'
import reducer, { initialState } from './src/reducer'

// components is its own object outside of render so that the references to
// components are stable
const components = {
  pre: preProps => {
    const props = preToCodeBlock(preProps)
    // if there's a codeString and some props, we passed the test
    if (props) {
      return <Code {...props} />
    } else {
      // it's possible to have a pre without a code in it
      return <pre {...preProps} />
    }
  },
}
export const wrapRootElement = ({ element }) => (
  <AppProvider>
    <StateProvider initialState={initialState} reducer={reducer}>
      <MDXProvider components={components}>
        {element}
      </MDXProvider>
    </StateProvider>
  </AppProvider>
)
