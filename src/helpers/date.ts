export const secondToTime = (second: number): string => {
  const hours = Math.floor(second / 3600)
    .toString()
    .padStart(2, '0')

  const minutes = Math.floor((second % 3600) / 60)
    .toString()
    .padStart(2, '0')

  const seconds = Math.ceil(second % 60)
    .toString()
    .padStart(2, '0')

  return `${hours !== '00' ? hours + ':' : ''}${minutes}:${seconds}`
}
