const Image = {
  key: 'image',
  name: 'Image',
  action: {
    UPDATE: 'UPDATE_IMAGE'
  }
}

const ContainerName = {
  key: 'container_name',
  name: 'Container Name',
  action: {
    UPDATE: 'UPDATE_CONTAINER_NAME'
  }
}

const Restart = {
  key: 'restart',
  name: 'Restart',
  action: {
    UPDATE: 'UPDATE_RESTART'
  }
}

const HealthCheck = {
  key: 'healthcheck',
  name: 'HealthCheck',
  action: {
    UPDATE: 'UPDATE_HEALTHCHECK'
  }
}

const Labels = {
  key: 'labels',
  name: 'Labels',
  action: {
    ADD: 'ADD_LABEL',
    UPDATE: 'UPDATE_LABEL',
    REMOVE: 'REMOVE_LABEL',
  }
}

const Ports = {
  key: 'ports',
  name: 'Ports',
  action: {
    ADD: 'ADD_PORT',
    UPDATE: 'UPDATE_PORT',
    REMOVE: 'REMOVE_PORT',
  }
}

const Environment = {
  key: 'environment',
  name: 'Environment',
  action: {
    ADD: 'ADD_ENVIRONMENT',
    UPDATE: 'UPDATE_ENVIRONMENT',
    REMOVE: 'REMOVE_ENVIRONMENT',
  }
}

const Volumes = {
  key: 'volumes',
  name: 'Volumes',
  action: {
    ADD: 'ADD_VOLUME',
    UPDATE: 'UPDATE_VOLUME',
    REMOVE: 'REMOVE_VOLUME',
  }
}

const Services = {
  key: 'services',
  name: 'Services',
  action: {
    ADD: 'ADD_SERVICE',
    UPDATE: 'UPDATE_SERVICE',
    REMOVE: 'REMOVE_SERVICE',
  }
}

export {
  Image,
  ContainerName,
  Restart,
  HealthCheck,
  Labels,
  Ports,
  Environment,
  Volumes,
  Services
}
