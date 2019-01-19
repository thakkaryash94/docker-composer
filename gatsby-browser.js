// custom typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it

const onServiceWorkerUpdateFound = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
    `Reload to display the latest version?`
  )

  if (answer === true) {
    window.location.reload()
  }
}

export { onServiceWorkerUpdateFound }
