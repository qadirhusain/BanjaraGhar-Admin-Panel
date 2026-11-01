import { Link } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Link to="/dashboard">Back to dashboard</Link>
    </>
  )
}