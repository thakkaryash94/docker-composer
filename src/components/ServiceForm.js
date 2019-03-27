import React, { useReducer, useState, Fragment } from 'react'
import { safeDump } from 'js-yaml'
import produce from "immer"
import { Button, TextStyle, InlineError, TextField, Select, Checkbox, Heading, Stack } from '@shopify/polaris'
import { get, set, keys, includes, clone, pullAt, fromPairs, transform } from 'lodash'
import { Image, ContainerName, Restart, HealthCheck, Labels, Ports, Environment, Volumes } from '../constants'


function rename(obj, key, newKey) {
  if (includes(keys(obj), key)) {
    obj[newKey] = clone(obj[key], true)
    delete obj[key]
  }
  return obj
}

const reducer = (state, action) =>
  produce(state, draft => {
    const { serviceIndex } = action
    switch (action.type) {
      case Image.action.UPDATE:
        draft.services[serviceIndex][Image.key] = action.value
        return

      case ContainerName.action.UPDATE:
        draft.services[serviceIndex][ContainerName.key] = action.value
        return

      case Restart.action.UPDATE:
        draft.services[serviceIndex][Restart.key] = action.value
        return

      case HealthCheck.action.UPDATE:
        if (action.value) {
          draft.services[serviceIndex][HealthCheck.key] = {
            disable: action.value
          }
        } else {
          delete draft.services[serviceIndex][HealthCheck.key]
        }
        return

      case Labels.action.UPDATE:
      case Ports.action.UPDATE:
      case Environment.action.UPDATE:
      case Volumes.action.UPDATE:
        set(draft.services[serviceIndex][action.key], action.location, action.value)
        return

      case Labels.action.ADD:
      case Ports.action.ADD:
      case Environment.action.ADD:
      case Volumes.action.ADD:
        draft.services[serviceIndex][action.key].push(['', ''])
        return

      case Labels.action.REMOVE:
      case Ports.action.REMOVE:
      case Environment.action.REMOVE:
      case Volumes.action.REMOVE:
        pullAt(draft.services[serviceIndex][action.key], action.location)
        return
    }
  })

const initialState = {
  services: [{
    labels: [['', '']],
    ports: [['', '']],
    environment: [['', '']],
    volumes: [['', '']],
  }]
}

function json2yml(state) {
  let service = clone(state.services[0])
  service.labels = transform(fromPairs(service.ports), (result, value, key) => {
    result.push(`${key}=${value}`)
    return true
  }, [])
  service.environment = transform(fromPairs(service.ports), (result, value, key) => {
    result.push(`${key}=${value}`)
    return true
  }, [])
  service.ports = transform(fromPairs(service.ports), (result, value, key) => {
    result.push(`${key}:${value}`)
    return true
  }, [])
  const finalFormData = {
    version: '3',
    services: {
      [keys(state.services)[0]]: {
        ...service
      }
    }
  }
  try {
    const yamlString = safeDump(finalFormData, {
      'styles': {
        '!!null': 'canonical'
      }
    })
    return yamlString
  } catch (error) {
    console.error(error)
    alert('something went wrong, check console logs')
  }
}

export default (props => {

  // hooks
  const [state, dispatch] = useReducer(reducer, initialState)
  const [serviceState, setServiceState] = useState({ service: {} })

  // Download docker-compose
  function downloadService(e) {
    e.preventDefault()
    const yamlData = json2yml(state)
    const data = new Blob([yamlData], { type: 'text/yaml' })
    const csvURL = window.URL.createObjectURL(data)
    const tempLink = document.createElement('a')
    tempLink.href = csvURL
    tempLink.setAttribute('download', 'docker-compose.yml')
    tempLink.click()
  }

  const restartOptions = [
    { label: 'No', value: 'no' },
    { label: 'Always', value: 'always' },
    { label: 'On Faliure', value: 'on-failure' },
    { label: 'Unless Stopped', value: 'unless-stopped' },
  ]

  function addService() {
    setServiceState(() => {
      return {
        ...serviceState,
        service: {}
      }
    })
  }

  function changeServiceState(index, value) {
    setServiceState(() => {
      return rename(serviceState, keys(serviceState)[index], value)
    })
  }

  const StackData = [Labels, Ports, Environment, Volumes]

  return (
    <div className="App">
      <form onSubmit={(e) => downloadService(e)}>
        <Heading element='h1'>Services</Heading>
        {state.services.map((service, serviceIndex) => (
          <Fragment key={serviceIndex}>
            <TextField label="Name" error={'service name required'} value={keys(state.services)[serviceIndex] || ''} onChange={value => changeServiceState(serviceIndex, value)} />
            <TextField label="Image" value={service.image} onChange={value => dispatch({ type: Image.action.UPDATE, serviceIndex, value })} />
            <TextField label="Container Name" value={service.container_name} onChange={value => dispatch({ type: ContainerName.action.UPDATE, serviceIndex, value })} />
            <Select label="Restart" options={restartOptions} value={service.restart} onChange={value => dispatch({ type: Restart.action.UPDATE, serviceIndex, value })} />
            <br />
            <TextStyle>Healthcheck<Checkbox label="healthcheck" labelHidden checked={service.healthcheck ? service.healthcheck.disable : false} onChange={value => dispatch({ type: HealthCheck.action.UPDATE, serviceIndex, value })} /></TextStyle>
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
          </Fragment>
        ))}
        <br />
        <Button icon="add" onClick={() => addService()}>Add Service</Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button icon="delete">Delete Service</Button>
        <br /><br />
        <Button primary submit={true}>Download</Button>
      </form>
    </div>
  )
})
