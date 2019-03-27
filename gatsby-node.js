const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const templatePost = path.resolve(`./src/templates/template-post.js`)
  return graphql(
    `
    {
      allMdx(
        sort: { fields: [frontmatter___date], order: DESC }
        limit: 1000
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              title
            }
            code {
              scope
            }
          }
        }
      }
    }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }


    // Create blog posts pages.
    const templates = result.data.allMdx.edges

    templates.forEach((template, index) => {
      const previous = index === templates.length - 1 ? null : templates[index + 1].node
      const next = index === 0 ? null : templates[index - 1].node
      createPage({
        path: template.node.fields.slug,
        component: templatePost,
        context: {
          slug: template.node.fields.slug,
          previous,
          next,
        }
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode, trailingSlash: false })
    createNodeField({
      name: `slug`,
      node,
      value: `/templates${value}`,
    })
  }
}

exports.onCreateWebpackConfig = ({ getConfig, stage }) => {
  const config = getConfig()
  if (stage.startsWith('develop') && config.resolve) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-dom': '@hot-loader/react-dom'
    }
  }
}
