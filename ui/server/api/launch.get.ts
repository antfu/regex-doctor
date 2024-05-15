export default defineEventHandler(async (ctx) => {
  const query = getQuery(ctx)
  try {
    // @ts-expect-error missing types
    await import('launch-editor').then(r => (r.default || r)(query.file))
  }
  catch (e) {
    console.error(e)
  }
  return undefined
})
