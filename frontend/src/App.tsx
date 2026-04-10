import { ListPage } from '@/views/ListPage'

export function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <nav
        style={{
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: '600' }}>🍴 La Cigale CRM V0</h1>
      </nav>
      <ListPage />
    </div>
  )
}

export default App
