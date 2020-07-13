import React, { Fragment, useState } from 'react'
import { Button, TextStyle, Modal, Popover, TextContainer, ActionList, TextField, Select, Checkbox, Heading, Stack } from '@shopify/polaris'
import { get } from 'lodash'
import { useStateValue } from '../../state'
import { Image, ContainerName, Restart, HealthCheck, Labels, Ports, Environment, Volumes, Services } from '../constants'
import { downloadCompose } from '../utils'

export default (() => {

  // hooks
  const [state, dispatch] = useStateValue()
  const [serviceOptionsState, setServiceOptionsState] = useState(false)
  const [stackOptionsState, setStackOptionsState] = useState(false)

  const restartOptions = [
    { label: 'No', value: 'no' },
    { label: 'Always', value: 'always' },
    { label: 'On Faliure', value: 'on-failure' },
    { label: 'Unless Stopped', value: 'unless-stopped' },
  ]

  const StackData = [Labels, Ports, Environment, Volumes]
  // const StackData = [Ports]

  const serviceNameErrorMessage = `Service name can't be blank`

  const stackOptionsButton = (
    <Button icon="add" onClick={() => setStackOptionsState(!stackOptionsState)}>
      Add
    </Button>
  )

  const serviceOptionsButton = (
    <Button icon="add" onClick={() => setServiceOptionsState(!serviceOptionsState)}>
      Add
    </Button>
  )

  return (
    <div className="App">
      <form onSubmit={(e) => downloadCompose(e, state)}>
        {state.services.map((service, serviceIndex) => (
          <Fragment key={serviceIndex}>
            <Heading>Service</Heading><Button icon="delete" onClick={() => dispatch({ type: Services.action.REMOVE, location: serviceIndex })}>Delete Service</Button>
            <TextField label="Name" value={state.serviceList[serviceIndex] || ''} onChange={value => dispatch({ type: Services.action.UPDATE, serviceIndex, value })} helpText={
              <span>{serviceNameErrorMessage}</span>
            } />
            <TextField label="Image" value={service.image || ''} onChange={value => dispatch({ type: Image.action.UPDATE, serviceIndex, value })} />
            <TextField label="Container Name" value={service.container_name || ''} onChange={value => dispatch({ type: ContainerName.action.UPDATE, serviceIndex, value })} />
            <Select label="Restart" options={restartOptions} value={service.restart || false} onChange={value => dispatch({ type: Restart.action.UPDATE, serviceIndex, value })} />
            <br />
            <TextStyle>Healthcheck<Checkbox label="healthcheck" labelHidden checked={service.healthcheck ? service.healthcheck.disable : false} onChange={value => dispatch({ type: HealthCheck.action.UPDATE, serviceIndex, value: value })} /></TextStyle>
            <br /><br />
            {StackData.map((stack, index) => (
              <Stack key={index} wrap={true} alignment="leading" vertical={true} spacing="tight">
                <Heading element="h5">{stack.name}</Heading>
                {service[stack.key].map((data, stackIndex) => (
                  <Stack.Item fill key={stackIndex}>
                    <Stack distribution="fill" spacing="tight">
                      <TextField label="Name" placeholder="key" labelHidden value={get(service, `${stack.key}[${stackIndex}][0]`, '')} onChange={value => dispatch({ type: stack.action.UPDATE, key: stack.key, serviceIndex, location: `[${stackIndex}][${0}]`, value: value })} />
                      <TextField label="Name" placeholder="value" labelHidden value={get(service, `${stack.key}[${stackIndex}][1]`, '')} onChange={value => dispatch({ type: stack.action.UPDATE, key: stack.key, serviceIndex, location: `[${stackIndex}][${1}]`, value: value })} />
                      <Button icon="delete" onClick={() => dispatch({ type: stack.action.REMOVE, key: stack.key, serviceIndex, location: stackIndex })} />
                    </Stack>
                  </Stack.Item>
                ))}
                <Button icon="add" onClick={() => dispatch({ type: stack.action.ADD, key: stack.key, serviceIndex })} />
              </Stack>
            ))}
            <Popover
              active={serviceOptionsState}
              activator={serviceOptionsButton}
              onClose={() => setServiceOptionsState(false)}
            >
              <ActionList
                items={[
                  {
                    content: 'labels',
                    onAction: () => {
                      console.log('Service clicked')
                    },
                  },
                  {
                    content: 'expose',
                    onAction: () => {
                      console.log('Network clicked')
                    },
                  },
                  {
                    content: 'env_file',
                    onAction: () => {
                      console.log('Volume clicked')
                    },
                  },
                ]}
              />
            </Popover>
            <br />
          </Fragment>
        ))}
        <br /><br />
        <Popover
          active={stackOptionsState}
          activator={stackOptionsButton}
          onClose={() => setStackOptionsState(false)}
        >
          <ActionList
            items={[
              {
                content: 'Serive',
                helpText: 'Contains configuration that is applied to each container started for that service.',
                onAction: () => {
                  dispatch({ type: Services.action.ADD })
                },
              },
              {
                content: 'Network',
                helpText: 'lets you create more complex topologies and specify custom network drivers and options.',
                onAction: () => {
                  console.log('Network clicked')
                },
              },
              {
                content: 'Volume',
                helpText: 'Mount host paths or named volumes, specified as sub-options to a service.',
                onAction: () => {
                  console.log('Volume clicked')
                },
              },
            ]}
          />
        </Popover>
        <br /><br />
        <Button primary submit={true}>Download</Button>
      </form>
      <Modal
        open={true}
        // onClose={this.toggleModal}
        title="Add Network"
        primaryAction={{
          content: 'Close',
          // onAction: this.toggleModal,
        }}
      >
        <Modal.Section>
          <Stack>
            <Stack.Item>
              <TextContainer>
                <p>
                  You can share this discount link with your customers via
                  email or social media. Your discount will be automatically
                  applied at checkout.
                  </p>
              </TextContainer>
            </Stack.Item>
            <Stack.Item fill>
              <TextField
                // ref={this.bindNode}
                label="Network Name"
                // onFocus={this.handleFocus}
                // value={DISCOUNT_LINK}
                onChange={() => { }}
              />
            </Stack.Item>
          </Stack>
          <Stack.Item fill>
            <TextField
              // ref={this.bindNode}
              label="Network Name"
              // onFocus={this.handleFocus}
              // value={DISCOUNT_LINK}
              onChange={() => { }}
            />
          </Stack.Item>
        </Modal.Section>
      </Modal>
    </div>
  )
})
