// @unocss-include
import type { VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { extractCodeLocation, extractPackagePath } from '../../src/shared/path'
import PackageNameDisplay from './PackageNameDisplay.vue'

export default defineComponent({
  name: 'FileLink',
  props: {
    filepath: {
      type: String,
      required: true,
    },
    cwd: {
      type: String,
    },
  },
  setup(props) {
    function openFile() {
      $fetch('/__open-in-editor', {
        query: {
          file: props.filepath.replace('file://', ''),
        },
      })
    }

    return () => {
      const [filename, line, col] = extractCodeLocation(props.filepath)

      let content: (string | VNode)[] = [filename]

      const r = extractPackagePath(filename)
      if (r.package) {
        content = [
          h(PackageNameDisplay, { name: r.package }),
          h('span', { class: 'op50' }, r.path),
        ]
      }
      else {
        if (props.cwd && filename.startsWith(props.cwd)) {
          let path = filename.slice(props.cwd.length)
          if (path.startsWith('/'))
            path = path.slice(1)
          content = [
            `./${path}`,
          ]
        }
      }

      if (line != null) {
        content.push(h('span', { class: 'op50' }, ':'))
        content.push(h('span', { class: 'text-orange' }, line))
        if (col != null) {
          content.push(h('span', { class: 'op50' }, ':'))
          content.push(h('span', { class: 'text-teal' }, col))
        }
      }

      return (
        h('button', {
          class: 'font-mono hover:underline',
          title: props.filepath,
          onClick: openFile,
        }, content)
      )
    }
  },
})
