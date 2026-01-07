import mitt from 'mitt'
import type { Emitter } from 'mitt'

type Events = {
  [key: string]: unknown
}

const mitter: Emitter<Events> = mitt<Events>()

export default mitter



