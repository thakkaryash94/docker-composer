import React, { useReducer, useState, Fragment } from 'react'
import { safeDump } from 'js-yaml'
import produce from "immer"
import { Button, TextStyle, InlineError, TextField, Select, Checkbox, Heading, Stack } from '@shopify/polaris'
import { get, set, keys, includes, clone, pullAt, fromPairs, transform } from 'lodash'


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
      case 'container_image':
        draft.container_name = action.value
        return
      case 'restart':
        draft.restart = action.value
        return
      case 'healthcheck':
        draft.healthcheck = {
          disable: action.value
        }
        return
    }
  })

const initialState = {}

export default (props => {

  // hooks
  const [state, dispatch] = useReducer(reducer, initialState)
  const [formState, setFormState] = useState(props.initialState || initialState)
  const [serviceState, setServiceState] = useState({ service: {} })
  const [labelState, setLabelValue] = useState([["", ""]])
  const [portState, setPortValue] = useState([["", ""]])
  const [envState, setEnvValue] = useState([["", ""]])
  const [volumes, setVolumeValue] = useState([["", ""]])

  function json2yml() {
    formState.labels = fromPairs(labelState)
    formState.environment = fromPairs(envState)
    formState.ports = transform(fromPairs(portState), (result, value, key) => {
      result.push(`${key}:${value}`)
      return true
    }, [])
    const finalFormData = {
      version: '3',
      services: {
        [keys(serviceState)[0]]: formState
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

  const onChange = (key, value) => {
    if (key === 'healthcheck') {
      setFormState(() => {
        return {
          ...formState,
          healthcheck: {
            disable: value
          }
        }
      })
    }
    else {
      setFormState(() => {
        return {
          ...formState,
          [key]: value
        }
      })
    }
  }

  function onNestedChange(location, value, state, fn) {
    fn(() => {
      return set(state, location, value)
    })
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
    { label: "Labels", state: labelState, fn: setLabelValue },
    { label: "Ports", state: portState, fn: setPortValue },
    { label: "Environment Variables", state: envState, fn: setEnvValue },
    { label: "Volumes", state: volumes, fn: setVolumeValue },
  ]

  return (
    <div className="App">
      <form onSubmit={(e) => downloadService(e)}>
        <Heading element='h1'>Services</Heading>
        {Object.keys(serviceState).map((service, index) => (
          <Fragment key={index}>
            <TextField label="Name" error={'service name required'} value={keys(serviceState)[index] || ''} onChange={value => changeServiceState(index, value)} />
            <TextField label="Image" value={formState.image} onChange={value => onChange("image", value)} />
            <TextField label="Container Name" value={state.container_name} onChange={value => dispatch({ type: "container_image", index, value })} />
            <Select label="Restart" options={restartOptions} value={state.restart} onChange={value => dispatch({ type: "restart", index, value })} />
            <TextStyle>Healthcheck<Checkbox label="healthcheck" labelHidden checked={state.healthcheck ? state.healthcheck.disable : false} onChange={value => dispatch({ type: "healthcheck", index, value })} /></TextStyle>
            {StackData.map((stack, index) => (
              <Stack key={index} wrap={true} alignment="leading" vertical={true} spacing="tight">
                <Heading element="h5">{stack.label}</Heading>
                {stack.state.map((label, index) => (
                  <Stack.Item fill key={index}>
                    <Stack distribution="fill" spacing="tight">
                      <TextField label="Name" placeholder="key" labelHidden value={get(stack.state, `[${index}][0]`, '')} onChange={value => onNestedChange(`[${index}][0]`, value, stack.state, stack.fn)} />
                      <TextField label="Name" placeholder="value" labelHidden value={get(stack.state, `[${index}][1]`, '')} onChange={value => { onNestedChange(`[${index}][1]`, value, stack.state, stack.fn) }} />
                      <Button icon="delete" onClick={() => deleteAt(stack.state, index, stack.fn)} />
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
