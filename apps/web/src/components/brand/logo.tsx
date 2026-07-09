import logo from '@/app/assets/brand/logo.png'
import Image from 'next/image'

interface LogoProps {
  size?: number
  showText?: boolean
}

export function Logo({ size = 40 }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <Image src={logo} alt="ClubRun" height={size} priority />
    </div>
  )
}
