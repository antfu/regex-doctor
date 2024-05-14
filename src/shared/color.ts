export function getHashColorFromString(
  name: string,
  opacity: number | string = 1,
  isDark = true,
) {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const h = hash % 360
  return getHsla(h, opacity, isDark)
}

export function getHsla(
  hue: number,
  opacity: number | string = 1,
  isDark = true,
) {
  const saturation = isDark ? 50 : 65
  const lightness = isDark ? 60 : 40
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
}
