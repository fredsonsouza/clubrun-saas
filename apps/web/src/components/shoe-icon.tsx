import React from 'react'
import { Footprints } from 'lucide-react'

interface ShoeIconProps extends React.ComponentProps<typeof Footprints> {}

export function ShoeIcon(props: ShoeIconProps) {
  return <Footprints {...props} />
}
