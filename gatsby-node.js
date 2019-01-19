const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const templatePost = path.resolve(`./src/templates/template-post.js`)
  return graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
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
    const templates = result.data.allMarkdownRemark.edges

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
        },
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode, trailingSlash: false })
    createNodeField({
      name: `slug`,
      node,
      value: `/templates${value}`,
    })
  }
}
