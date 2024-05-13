// @unocss-include
import type { VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { extractLocation } from 'error-stack-parser-es/lite'

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
      const [filename, line, col] = extractLocation(props.filepath)

      let content: (string | VNode)[] = [filename]
      if (filename.includes('/node_modules/')) {
        const match = [...filename?.matchAll(/\/node_modules\//g)]
        const last = match[match.length - 1]
        if (last) {
          const packageName = filename.slice(last.index + last[0].length)
            .match(/^(@[^/]+\/[^/]+)|([^/]+)/)?.[0]
          if (packageName) {
            content = [
              h('span', { class: 'text-yellow-500' }, packageName),
              h('span', { class: 'op50' }, filename.slice(last.index + last[0].length + packageName.length)),
            ]
          }
        }
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
