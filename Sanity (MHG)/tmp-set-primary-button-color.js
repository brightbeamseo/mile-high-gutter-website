import {getCliClient} from 'sanity/cli'

async function run() {
  const client = getCliClient({apiVersion: '2025-08-15'})
  const documentId = 'siteSettingsSingleton'
  const accent = '#143980'
  const accentHover = '#102f6d'

  await client
    .patch(documentId)
    .set({
      'theme.colors.accent': accent,
      'theme.colors.accentHover': accentHover,
    })
    .commit()

  const updated = await client.fetch(
    '*[_id == $id][0]{_id,_updatedAt,"accent":theme.colors.accent,"accentHover":theme.colors.accentHover}',
    {id: documentId},
  )

  console.log(JSON.stringify(updated, null, 2))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
