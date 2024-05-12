/* eslint-disable prefer-regex-literals */
const regex1 = /play\((\d+)\)/
const regex2 = /(a|b|c)+/i
const regex3 = /play\((\d+)\)/

regex1.test('play(123)')
regex1.test('play(123)')
regex2.test('AbC')
regex3.test('AbC')

const dynamic = new RegExp('foo')

dynamic.test('foo')

// 'play(321)'.match(regex1)
// 'play(456)'.replace(regex1, 'replaced')
// regex1.exec('play(789)')
// 'play(987)'.search(regex1)
// 'play(654)'.split(regex1)
const reFoo = /foo/

function foo(str: string) {
  return str.match(reFoo)
}

foo('foo')
foo('foo')
foo('foo')
foo('foo')
foo('foo')
foo('foo')

export {}
