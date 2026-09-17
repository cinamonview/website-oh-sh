import { Link } from 'react-router-dom'

function Header({ loginId, onLogout }) {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="주요 메뉴">
        <div className="site-nav-links">
          <Link to="/">홈 (DB 저장 테스트)</Link>
          <Link to="/board">자유게시판</Link>
          <Link to="/archive">자료실</Link>
          <Link to="/qna">Q&amp;A 게시판</Link>
        </div>
        {loginId ? (
          <div className="site-nav-account">
            <Link to="/mypage">내 정보</Link>
            <span>{loginId}님</span>
            <button type="button" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="site-nav-account">
            <Link to="/register">회원가입</Link>
            <Link to="/login">로그인</Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
