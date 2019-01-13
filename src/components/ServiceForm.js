import React, { Component } from 'react'
import { BaseStyles, ButtonPrimary, Flex, TextInput, Heading, Text, Box } from '@primer/components'

class ServiceForm extends Component {
  render() {
    return (
      <div className="App">
        <BaseStyles>
          <Box m={4} width={[1]}>
            <div className="container-lg clearfix">
              <div className="offset-1 col-10 float-left border p-4">
                <form>
                  <Text>Name</Text>
                  <TextInput aria-label="Zipcode" name="zipcode" />
                </form>
              </div>
              <div className="Box-footer">
                <ButtonPrimary>Download</ButtonPrimary>
              </div>
            </div>
          </Box>
        </BaseStyles>

      </div>
    )
  }
}

export default ServiceForm
