import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './Register.jsx'
import Login from './Login.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import MyPage from './MyPage.jsx'
import Layout from './components/Layout.jsx'
import Board from './pages/Board.jsx'
import BoardDetail from './pages/BoardDetail.jsx'
import BoardWrite from './pages/BoardWrite.jsx'
import BoardEdit from './pages/BoardEdit.jsx'
import Archive from './pages/Archive.jsx'
import ArchiveDetail from './pages/ArchiveDetail.jsx'
import ArchiveWrite from './pages/ArchiveWrite.jsx'
import ArchiveEdit from './pages/ArchiveEdit.jsx'
import Qna from './pages/board/Qna.jsx'
import QnaDetail from './pages/board/QnaDetail.jsx'
import QnaWrite from './pages/board/QnaWrite.jsx'
import QnaEdit from './pages/board/QnaEdit.jsx'

function TestMember() {
  const sendMember = () => {
    fetch('http://localhost:8080/api/test-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '홍길동',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
      })
  }

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div>
          <p className="home-eyebrow">WEBSITE OH-SH</p>
          <h1 id="home-title">함께 나누고, 함께 기록하는 공간</h1>
          <p className="home-intro">
            자유로운 이야기와 유용한 자료를 한곳에서 만나보세요.
          </p>
          <div className="home-actions">
            <Link className="button button-primary" to="/board">게시판 둘러보기</Link>
            <Link className="button button-secondary" to="/archive">자료실 보기</Link>
          </div>
        </div>
        <div className="home-status" aria-label="서비스 안내">
          <span className="home-status-dot" />
          <span>새로운 이야기를 기다리고 있어요</span>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-features-title">
        <div className="section-heading">
          <p className="home-eyebrow">EXPLORE</p>
          <h2 id="home-features-title">무엇을 찾고 계신가요?</h2>
          <p>필요한 공간으로 바로 이동해보세요.</p>
        </div>
        <div className="feature-grid">
          <Link className="feature-card" to="/board">
            <span className="feature-number">01</span>
            <h3>자유게시판</h3>
            <p>일상의 이야기와 생각을 자유롭게 나눠보세요.</p>
            <span className="feature-link">둘러보기 →</span>
          </Link>
          <Link className="feature-card" to="/qna">
            <span className="feature-number">02</span>
            <h3>Q&amp;A 게시판</h3>
            <p>궁금한 점을 묻고 다른 사람의 경험을 만나보세요.</p>
            <span className="feature-link">질문과 답변 →</span>
          </Link>
          <Link className="feature-card" to="/archive">
            <span className="feature-number">03</span>
            <h3>자료실</h3>
            <p>필요한 파일과 자료를 편리하게 확인해보세요.</p>
            <span className="feature-link">자료 확인하기 →</span>
          </Link>
        </div>
      </section>

      <section className="home-test-panel" aria-labelledby="test-panel-title">
        <div>
          <p className="home-eyebrow">DEVELOPMENT TOOL</p>
          <h2 id="test-panel-title">DB 저장 테스트</h2>
          <p>회원 저장 API 연결 상태를 확인할 수 있습니다.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={sendMember}>
          회원 저장하기
        </button>
      </section>
    </div>
  )
}

function App() {
  const [loginId, setLoginId] = useState(null)

  const checkSession = () => {
    fetch('http://localhost:8080/api/members/session', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setLoginId(data.loginId)
        } else {
          setLoginId(null)
        }
      })
      .catch((err) => {
        console.error('세션 확인 에러:', err)
        setLoginId(null)
      })
  }

  useEffect(() => {
    checkSession()
  }, [])

  const handleLogout = () => {
    fetch('http://localhost:8080/api/members/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLoginId(null)
        }
      })
      .catch((err) => {
        console.error('로그아웃 에러:', err)
      })
  }

  return (
    <BrowserRouter>
      <Layout loginId={loginId} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<TestMember />} />
          <Route path="/board" element={<Board />} />
          <Route path="/board/write" element={<BoardWrite />} />
          <Route path="/board/:id/edit" element={<BoardEdit />} />
          <Route path="/board/:id" element={<BoardDetail />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/write" element={<ArchiveWrite />} />
          <Route path="/archive/:id/edit" element={<ArchiveEdit />} />
          <Route path="/archive/:id" element={<ArchiveDetail />} />
          <Route path="/qna" element={<Qna />} />
          <Route path="/qna/write" element={<QnaWrite />} />
          <Route path="/qna/:id/edit" element={<QnaEdit />} />
          <Route path="/qna/:id" element={<QnaDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={checkSession} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/mypage" element={<MyPage key={loginId || 'logged-out'} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App