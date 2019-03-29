import produce from "immer"
import { Image, ContainerName, Restart, HealthCheck, Labels, Ports, Environment, Volumes, Services } from './constants'
import { set, pullAt } from 'lodash'

const serviceModel = {
  healthcheck: {
    disable: true
  },
  labels: [['', '']],
  ports: [['', '']],
  environment: [['', '']],
  volumes: [['', '']],
}

export const initialState = {
  serviceList: [''],
  services: [serviceModel]
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
        draft.services[serviceIndex][HealthCheck.key] = {
          disable: action.value
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

      case Services.action.ADD:
        draft.serviceList[draft.serviceList.length] = ''
        draft.services.push(service)
        return

      case Services.action.UPDATE:
        draft.serviceList[serviceIndex] = action.value
        return

      case Services.action.REMOVE:
        pullAt(draft.services, action.location)
        pullAt(draft.serviceList, action.location)
        return

      case Services.action.SET:
        const { services, serviceList } = action.state
        draft.serviceList = serviceList
        draft.services = []
        for (let service of services) {

          let labels = []
          let ports = []
          let environments = []
          let volumes = []

          if (service.labels) {
            for (const label of service.labels) {
              labels.push(label.split('='))
            }
          } else {
            labels = serviceModel.labels
          }
          service.labels = labels

          if (service.ports) {
            for (const port of service.ports) {
              ports.push(port.split(':'))
            }
          } else {
            ports = serviceModel.ports
          }
          service.ports = ports

          if (service.environment) {
            for (const environment of service.environment) {
              environments.push(environment.split('='))
            }
          } else {
            environment = serviceModel.environment
          }
          service.environment = environments

          if (service.volumes) {
            for (const volume of service.volumes) {
              volumes.push(volume.split(':'))
            }
          } else {
            volumes = serviceModel.volumes
          }
          service.volumes = volumes

          draft.services.push(service)
        }
        return
    }
  })

export default reducer
