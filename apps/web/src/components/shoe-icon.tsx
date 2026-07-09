import { Footprints } from 'lucide-react'
import type React from 'react'

interface ShoeIconProps extends React.ComponentProps<typeof Footprints> {}

export function ShoeIcon(props: ShoeIconProps) {
  return <Footprints {...props} />
}
