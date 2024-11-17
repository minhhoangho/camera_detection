
export type ResultImage = {
  image: any,
  total: number,
  objects: Array<any>
}


export type PredictionResult = {
  model_type: string
  output: ResultImage
  time: number
}
