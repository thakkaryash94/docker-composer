import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'

import ServiceForm from '../components/ServiceForm'

const IndexPage = () => (
  <Layout>
    <SEO title="Home" keywords={[`docker`, `compose`, `yaml`]} />
    <ServiceForm />
  </Layout>
)

export default IndexPage
