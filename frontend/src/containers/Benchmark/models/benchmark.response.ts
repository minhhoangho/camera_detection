
export type ResultImage = {
  image: any,
  total: number,
  objects: Array<any>
}


export type PredictionResult = {
  modelType: string
  output: ResultImage
  time: number
}
