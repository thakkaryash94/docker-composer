import React, { Fragment } from 'react'
import { Button, TextStyle, InlineError, TextField, Select, Checkbox, Heading, Stack } from '@shopify/polaris'
import { get } from 'lodash'
import { useStateValue } from '../../state'
import { Image, ContainerName, Restart, HealthCheck, Labels, Ports, Environment, Volumes, Services } from '../constants'
import { downloadCompose } from '../utils'

export default (() => {

  // hooks
  const [state, dispatch] = useStateValue()

  const restartOptions = [
    { label: 'No', value: 'no' },
    { label: 'Always', value: 'always' },
    { label: 'On Faliure', value: 'on-failure' },
    { label: 'Unless Stopped', value: 'unless-stopped' },
  ]

  const StackData = [Labels, Ports, Environment, Volumes]
  // const StackData = [Ports]

  const serviceNameErrorMessage = `Service name can't be blank`

  return (
    <div className="App">
      <form onSubmit={(e) => downloadCompose(e, state)}>
        {state.services.map((service, serviceIndex) => (
          <Fragment key={serviceIndex}>
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
            <br />
            <Button icon="delete" onClick={() => dispatch({ type: Services.action.REMOVE, location: serviceIndex })}>Delete Service</Button>
          </Fragment>
        ))}
        <br /><br />
        <Button icon="add" onClick={() => dispatch({ type: Services.action.ADD })}>Add Service</Button>
        <br /><br />
        <Button primary submit={true}>Download</Button>
      </form>
    </div>
  )
})
