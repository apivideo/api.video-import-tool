import type { NextPage } from 'next'
import MigrationTool from '../components/MigrationTool'
import { Providers } from '../types/providers'

const VimeoHome: NextPage = () => {
  return (
    <MigrationTool provider={Providers.VIMEO} />
  )
}

export default VimeoHome
