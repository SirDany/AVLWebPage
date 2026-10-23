export function orbitIndex(position: number, count: number): number {
  return count > 0 ? ((position % count) + count) % count : 0
}

export function orbitNodes(position: number, count: number) {
  const visible = Math.min(count, 5)
  const first = -Math.floor((visible - 1) / 2)
  return Array.from({ length: visible }, (_, offset) => {
    const distance = first + offset
    return {
      position: position + distance,
      index: orbitIndex(position + distance, count),
      distance,
    }
  })
}
