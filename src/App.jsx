import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import DeliveryPage from './pages/DeliveryPage'
import AboutPage from './pages/AboutPage'
import ContactsPage from './pages/ContactsPage'
import BlogPage from './pages/BlogPage'
import AuthCallback from './pages/AuthCallback'
import NotFoundPage from './pages/NotFoundPage'

// Стабы страниц — заменим на полные реализации поочерёдно
const Stub = ({ title }) => (
  <div style={{ paddingTop: 'calc(var(--header-height) + 60px)', paddingLeft: 32, paddingBottom: 80, minHeight: '60vh' }}>
    <h1 style={{ fontSize: 40, fontWeight: 800 }}>{title}</h1>
    <p style={{ color: '#6f6f6f', marginTop: 12 }}>Страница в разработке</p>
  </div>
)

function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/catalog" element={<Layout><CatalogPage /></Layout>} />
      <Route path="/catalog/:category" element={<Layout><CatalogPage /></Layout>} />
      <Route path="/catalog/:category/:id" element={<Layout><ProductPage /></Layout>} />
      <Route path="/delivery" element={<Layout><DeliveryPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contacts" element={<Layout><ContactsPage /></Layout>} />
      <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><Stub title="Статья" /></Layout>} />
      <Route path="/documents" element={<Layout><Stub title="Документы" /></Layout>} />
      <Route path="/documents/:doc" element={<Layout><Stub title="Документ" /></Layout>} />

      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  )
}
