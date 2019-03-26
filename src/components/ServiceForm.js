import React, { useReducer, useState, Fragment } from 'react'
import { safeDump } from 'js-yaml'
import produce from "immer"
import { Button, TextStyle, InlineError, TextField, Select, Checkbox, Heading, Stack } from '@shopify/polaris'
import { get, set, keys, includes, clone, pullAt, fromPairs, transform } from 'lodash'

const IMAGE = 'IMAGE'
const CONTAINER_NAME = 'CONTAINER_NAME'
const RESTART = 'RESTART'
const HEALTHCHECK = 'HEALTHCHECK'
const LABELS = 'LABELS'
const PORTS = 'PORTS'
const ENVIRONMENT = 'ENVIRONMENT'
const VOLUMES = 'VOLUMES'

function rename(obj, key, newKey) {
  if (includes(keys(obj), key)) {
    obj[newKey] = clone(obj[key], true)
    delete obj[key]
  }
  return obj
}

const reducer = (state, action) =>
  produce(state, draft => {
    switch (action.type) {
      case IMAGE:
        draft.services[action.serviceIndex].image = action.value
        return
      case CONTAINER_NAME:
        draft.services[action.serviceIndex].container_name = action.value
        return
      case RESTART:
        draft.services[action.serviceIndex].restart = action.value
        return
      case HEALTHCHECK:
        draft.services[action.serviceIndex].healthcheck = {
          disable: action.value
        }
        return
      case LABELS:
      case PORTS:
      case ENVIRONMENT:
      case VOLUMES:
        set(draft.services[action.serviceIndex][action.key], action.location, action.value)
        return
    }
  })

const initialState = {
  services: [{
    labels: [["", ""]],
    ports: [["", ""]],
    environment: [["", ""]],
    volumes: ["", ""],
  }]
}

export default (props => {

  // hooks
  const [state, dispatch] = useReducer(reducer, initialState)
  const [serviceState, setServiceState] = useState({ service: {} })

  function json2yml() {
    let service = clone(state.services[0])
    service.labels = fromPairs(service.labels)
    service.environment = fromPairs(service.environment)
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

  // Download docker-compose
  function downloadService(e) {
    e.preventDefault()
    const yamlData = json2yml()
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

  function addNested(state, fn) {
    fn(() => {
      state.push(["", ""])
      return state
    })
  }

  function addService() {
    setServiceState(() => {
      return {
        ...serviceState,
        service: {}
      }
    })
  }

  function deleteAt(state, index, fn) {
    fn(() => {
      pullAt(state, index)
      return state
    })
  }

  function changeServiceState(index, value) {
    setServiceState(() => {
      return rename(serviceState, keys(serviceState)[index], value)
    })
  }

  const StackData = [
    { label: "Labels", key: 'labels', type: LABELS },
    { label: "Ports", key: 'ports', type: PORTS },
    { label: "Environment Variables", key: 'environment', type: ENVIRONMENT },
    { label: "Volumes", key: 'volumes', type: VOLUMES },
  ]

  return (
    <div className="App">
      <form onSubmit={(e) => downloadService(e)}>
        <Heading element='h1'>Services</Heading>
        {state.services.map((service, serviceIndex) => (
          <Fragment key={serviceIndex}>
            <TextField label="Name" error={'service name required'} value={keys(state.services)[serviceIndex] || ''} onChange={value => changeServiceState(serviceIndex, value)} />
            <TextField label="Image" value={service.image} onChange={value => dispatch({ type: IMAGE, serviceIndex, value })} />
            <TextField label="Container Name" value={service.container_name} onChange={value => dispatch({ type: CONTAINER_NAME, serviceIndex, value })} />
            <Select label="Restart" options={restartOptions} value={service.restart} onChange={value => dispatch({ type: RESTART, serviceIndex, value })} />
            <TextStyle>Healthcheck<Checkbox label="healthcheck" labelHidden checked={service.healthcheck ? service.healthcheck.disable : false} onChange={value => dispatch({ type: HEALTHCHECK, serviceIndex, value })} /></TextStyle>
            {StackData.map((stack, index) => (
              <Stack key={index} wrap={true} alignment="leading" vertical={true} spacing="tight">
                <Heading element="h5">{stack.label}</Heading>
                {service[stack.key].map((data, stackIndex) => (
                  <Stack.Item fill key={stackIndex}>
                    <Stack distribution="fill" spacing="tight">
                      <TextField label="Name" placeholder="key" labelHidden value={get(service, `${stack.key}[${stackIndex}][0]`, '')} onChange={value => dispatch({ type: stack.type, key: stack.key, serviceIndex, location: `[${stackIndex}][${0}]`, value: value })} />
                      <TextField label="Name" placeholder="value" labelHidden value={get(service, `${stack.key}[${stackIndex}][1]`, '')} onChange={value => dispatch({ type: stack.type, key: stack.key, serviceIndex, location: `[${stackIndex}][${1}]`, value: value })} />
                      <Button icon="delete" onClick={() => deleteAt(stack.state, stackIndex, stack.fn)} />
                    </Stack>
                  </Stack.Item>
                ))}
                <Button icon="add" onClick={() => addNested(stack.state, stack.fn)} />
              </Stack>
            ))}
          </Fragment>
        ))}
        <Button icon="delete">Delete Service</Button>
        <Button icon="add" onClick={() => addService()}>Add Service</Button>
        <Button primary submit={true}>Download</Button>
      </form>
    </div>
  )
})
