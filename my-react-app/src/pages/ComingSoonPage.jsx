import PageHeader from '@/components/common/PageHeader'

export default function ComingSoonPage({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>
        This page is coming soon.
      </div>
    </>
  )
}