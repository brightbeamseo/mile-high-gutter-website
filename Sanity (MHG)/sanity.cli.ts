import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'vvvqtudm',
    dataset: 'production'
  },
  deployment: {
    /** Hosted Studio at https://mile-high-gutter.sanity.studio — avoids re-prompting on `sanity deploy` */
    appId: 'xd32jlcewkwgmvdp40envcub',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
