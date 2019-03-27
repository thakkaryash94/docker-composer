import produce from "immer"
import { Image, ContainerName, Restart, HealthCheck, Labels, Ports, Environment, Volumes, Services } from './constants'
import { set, pullAt } from 'lodash'

const service = {
  labels: [['', '']],
  ports: [['', '']],
  environment: [['', '']],
  volumes: [['', '']],
}

export const initialState = {
  serviceList: [''],
  services: [service]
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
    }
  })

export default reducer
