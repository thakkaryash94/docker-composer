import React, { useState } from 'react'
import { safeLoad } from 'js-yaml'
import { DropZone } from '@shopify/polaris'
import Layout from '../components/layout'
import SEO from '../components/seo'
import ServiceForm from '../components/ServiceForm'

export default () => {
  const [initialState, setInitialState] = useState({})

  function setDropped(acceptedFiles) {
    // Do something with files
    var file = acceptedFiles[0]
    const reader = new FileReader();
    reader.onload = (event) => {
      const yamlData = event.target.result
      const jsonData = safeLoad(yamlData, 'utf8')
      setInitialState(() => jsonData)
    };
    reader.readAsText(file)
  }

  return (
    <Layout>
      <SEO title="Home" keywords={[`docker`, `compose`, `yaml`]} />
      {/* <DropZone
        onDrop={(files, acceptedFiles, rejectedFiles) => {
          setDropped(acceptedFiles)
        }}
      ></DropZone> */}
      <ServiceForm initialState={initialState || undefined} />
    </Layout>
  )
}
