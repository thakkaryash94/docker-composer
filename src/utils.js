import { safeDump, safeLoad } from 'js-yaml'
import { cloneDeep, fromPairs, transform } from 'lodash'

export function json2yml(state) {
  const finalServices = {}
  const services = cloneDeep(state.services)
  for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
    let service = services[serviceIndex]

    service.healthcheck.disable = !service.healthcheck.disable

    if (service.labels.length > 0) {
      service.labels = transform(fromPairs(service.labels), (result, value, key) => {
        result.push(`${key}=${value}`)
        return true
      }, [])
    } else {
      delete service.labels
    }

    if (service.environment.length > 0) {
      service.environment = transform(fromPairs(service.environment), (result, value, key) => {
        result.push(`${key}=${value}`)
        return true
      }, [])
    } else {
      delete service.environment
    }

    if (service.ports.length > 0) {
      service.ports = transform(fromPairs(service.ports), (result, value, key) => {
        result.push(`${key}:${value}`)
        return true
      }, [])
    } else {
      delete service.ports
    }

    if (service.volumes.length > 0) {
      service.volumes = transform(fromPairs(service.volumes), (result, value, key) => {
        result.push(`${key}:${value}`)
        return true
      }, [])
    } else {
      delete service.volumes
    }
    finalServices[state.serviceList[serviceIndex]] = service
  }
  const finalFormData = {
    version: '3',
    services: finalServices
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

export function yaml2json(yamlData) {
  const jsonData = safeLoad(yamlData, 'utf8')
  const services = jsonData.services
  const draftServices = {
    serviceList: Object.keys(services),
    services: []
  }
  for (const service in services) {
    if (services.hasOwnProperty(service)) {
      const element = services[service]
      draftServices.services.push(element)
    }
  }
  return draftServices
}
