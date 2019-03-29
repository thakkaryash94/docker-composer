import React, { useState } from 'react'
import { DropZone, Layout, Card } from '@shopify/polaris'
import AppLayout from '../components/Layout'
import SEO from '../components/seo'
import ServiceForm from '../components/ServiceForm'
import { useStateValue } from '../../state'
import { yaml2json } from '../utils'
import { Services } from '../constants'

export default () => {
  const [state, dispatch] = useStateValue()
  const [filesState, setFilesState] = useState([])

  function setDropped(acceptedFiles) {
    // Do something with files
    setFilesState(() => acceptedFiles)
    var file = acceptedFiles[0]
    const reader = new FileReader();
    reader.onload = (event) => {
      const stateData = yaml2json(event.target.result)
      dispatch({ action: Services.action.SET, state: stateData })
    }
    reader.readAsText(file)
  }

  const fileUpload = !filesState.length && <DropZone.FileUpload />
  return (
    <AppLayout>
      <SEO title="Home" keywords={[`docker`, `compose`, `yaml`]} />
      <Layout>
        {filesState.length === 0 &&
          <Layout.Section secondary>
            <DropZone
              onDrop={(files, acceptedFiles, rejectedFiles) => {
                setDropped(acceptedFiles)
              }}>
              {fileUpload}
            </DropZone>
          </Layout.Section>
        }
        <Layout.Section>
          <Card title="Services" sectioned>
            <ServiceForm />
          </Card>
        </Layout.Section>
      </Layout>
    </AppLayout>
  )
}
