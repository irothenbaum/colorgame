export default async function pause(durationMS: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, durationMS)
  })
}
