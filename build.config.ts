import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/register',
    'src/cli',
    'src/dirs',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
