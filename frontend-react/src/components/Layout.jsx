import Footer from './Footer.jsx'
import Header from './Header.jsx'

function Layout({ children, loginId, onLogout }) {
  return (
    <div className="site-layout">
      <Header loginId={loginId} onLogout={onLogout} />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
