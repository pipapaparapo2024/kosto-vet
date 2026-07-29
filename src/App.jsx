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
import BlogArticlePage from './pages/BlogArticlePage'
import DocumentsPage from './pages/DocumentsPage'
import AuthCallback from './pages/AuthCallback'
import NotFoundPage from './pages/NotFoundPage'

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
      <Route path="/blog/:slug" element={<Layout><BlogArticlePage /></Layout>} />
      <Route path="/documents" element={<Layout><DocumentsPage /></Layout>} />
      <Route path="/documents/:doc" element={<Layout><DocumentsPage /></Layout>} />

      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  )
}
