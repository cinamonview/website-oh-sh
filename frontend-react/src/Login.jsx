import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Member.css'

const SAVED_LOGIN_ID_COOKIE = 'savedLoginId'
const SAVED_LOGIN_ID_EXPIRE_DAYS = 30

function getSavedLoginIdCookie() {
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=')
    if (name === SAVED_LOGIN_ID_COOKIE) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return ''
}

function setSavedLoginIdCookie(loginId) {
  const expires = new Date()
  expires.setDate(expires.getDate() + SAVED_LOGIN_ID_EXPIRE_DAYS)
  document.cookie = `${SAVED_LOGIN_ID_COOKIE}=${encodeURIComponent(loginId)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
}

function removeSavedLoginIdCookie() {
  document.cookie = `${SAVED_LOGIN_ID_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    loginId: getSavedLoginIdCookie(),
    password: '',
  })
  const [rememberLoginId, setRememberLoginId] = useState(Boolean(getSavedLoginIdCookie()))
  const [result, setResult] = useState(null) // { success: boolean, message: string }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setResult(null)

    if (!formData.loginId.trim() || !formData.password.trim()) {
      alert('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    fetch('/api/members/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginId: formData.loginId,
        password: formData.password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data)
        if (data.success) {
          if (rememberLoginId) {
            setSavedLoginIdCookie(formData.loginId)
          } else {
            removeSavedLoginIdCookie()
          }
          onLogin()
          navigate('/mypage')
        }
      })
      .catch((err) => {
        console.error('로그인 요청 에러:', err)
        setResult({
          success: false,
          message: '로그인 요청 중 오류가 발생했습니다.',
        })
      })
  }

  return (
    <div className="member-page">
      <div className="member-card">
      <h2>로그인</h2>
      <form className="member-form" onSubmit={handleSubmit}>
        {/* 아이디 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>아이디:</label>
          <input
            type="text"
            name="loginId"
            value={formData.loginId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* 비밀번호 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>비밀번호:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div className="member-field">
          <label className="member-checkbox-label">
            <input
              type="checkbox"
              checked={rememberLoginId}
              onChange={(e) => setRememberLoginId(e.target.checked)}
            />
            아이디 저장
          </label>
        </div>

        {/* 로그인 버튼 */}
        <button
          className="member-button member-button-full"
          type="submit"
          style={{ width: '100%', padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          로그인
        </button>

        <div className="member-links">
          <Link to="/forgot-password">비밀번호 찾기</Link>
        </div>

        {/* 로그인 결과 안내 메시지 */}
        {result && (
          <p
            className={`member-submit-message ${result.success ? 'member-message-success' : 'member-message-error'}`}
          >
            {result.message}
          </p>
        )}
      </form>
      </div>
    </div>
  )
}

export default Login
