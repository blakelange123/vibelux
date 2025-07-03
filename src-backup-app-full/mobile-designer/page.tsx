'use client'

import { MobileDesignerWrapper } from '@/components/designer/MobileDesigner'
import { useMobile } from '@/hooks/useMobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MobileDesignerPage() {
  const { isDesktop } = useMobile()
  const router = useRouter()

  // Redirect desktop users to full designer
  useEffect(() => {
    if (isDesktop) {
      router.push('/designer')
    }
  }, [isDesktop, router])

  return <MobileDesignerWrapper />
}