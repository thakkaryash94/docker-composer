import { safeDump } from 'js-yaml'
import { clone, fromPairs, keys, transform } from 'lodash'
export function json2yml(state) {
  let service = clone(state.services[0])
  service.labels = transform(fromPairs(service.labels), (result, value, key) => {
    result.push(`${key}=${value}`)
    return true
  }, [])
  service.environment = transform(fromPairs(service.environment), (result, value, key) => {
    result.push(`${key}=${value}`)
    return true
  }, [])
  service.ports = transform(fromPairs(service.ports), (result, value, key) => {
    result.push(`${key}:${value}`)
    return true
  }, [])
  service.volumes = transform(fromPairs(service.volumes), (result, value, key) => {
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


export function downloadCompose(e, state) {
  e.preventDefault()
  const yamlData = json2yml(state)
  // console.log(yamlData)
  const data = new Blob([yamlData], { type: 'text/yaml' })
  const csvURL = window.URL.createObjectURL(data)
  const tempLink = document.createElement('a')
  tempLink.href = csvURL
  tempLink.setAttribute('download', 'docker-compose.yml')
  tempLink.click()
}
