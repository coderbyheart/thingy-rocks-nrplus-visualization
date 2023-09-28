import { Layout } from './layouter.ts'

export const compareLayouts = (
  layout1: Layout,
  layout2: Layout,
  gravity = 0.0001,
): boolean => {
  // Must contain the same nodes
  if (Object.keys(layout1).length !== Object.keys(layout2).length) return false
  return Object.entries(layout1).reduce(
    (allEqual, [id, pos]) =>
      allEqual
        ? Math.abs(layout2[id][0] - pos[0]) < gravity && Math.abs(layout2[id][1] - pos[1]) < gravity
        : false,
    true,
  )
}
