import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './Register.jsx'
import Login from './Login.jsx'
import MyPage from './MyPage.jsx'
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
    <div>
      <h1>DB 저장 테스트</h1>

      <button onClick={sendMember}>
        회원 저장하기
      </button>
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
      <nav style={{ padding: '10px 20px', borderBottom: '1px solid #ddd', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/">홈 (DB 저장 테스트)</Link>
        <Link to="/board">자유게시판</Link>
        <Link to="/archive">자료실</Link>
        <Link to="/qna">Q&A 게시판</Link>
        {loginId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <Link to="/mypage">내 정보</Link>
            <span>{loginId}님</span>
            <button onClick={handleLogout} style={{ padding: '4px 8px', cursor: 'pointer' }}>
              로그아웃
            </button>
          </div>
        ) : (
          <>
            <Link to="/register">회원가입</Link>
            <Link to="/login">로그인</Link>
          </>
        )}
      </nav>

      <div style={{ padding: '0 20px' }}>
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
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App