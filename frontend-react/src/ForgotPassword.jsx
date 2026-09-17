import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Member.css'

function ForgotPassword() {
  const [formData, setFormData] = useState({
    loginId: '',
    email: '',
  })
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('')
    setIsSuccess(false)
    setIsSending(true)

    fetch('/api/members/password/reset', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setIsSuccess(ok && data.success)
        setMessage(data.message || (ok
          ? '임시 비밀번호가 이메일로 발송되었습니다.'
          : '회원정보가 일치하지 않습니다.'))
        setIsSending(false)
      })
      .catch((err) => {
        console.error('비밀번호 찾기 에러:', err)
        setIsSuccess(false)
        setMessage('비밀번호 찾기 처리 중 오류가 발생했습니다.')
        setIsSending(false)
      })
  }

  return (
    <div className="member-page">
      <div className="member-card">
      <h2>비밀번호 찾기</h2>
      <form className="member-form" onSubmit={handleSubmit}>
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

        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>이메일:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          className="member-button member-button-full"
          type="submit"
          disabled={isSending}
          style={{ width: '100%', padding: '10px', cursor: isSending ? 'not-allowed' : 'pointer' }}
        >
          {isSending ? '발송 중...' : '임시 비밀번호 발송'}
        </button>

        {message && (
          <p className={`member-message ${isSuccess ? 'member-message-success' : 'member-message-error'}`}>
            {message}
          </p>
        )}

        <div className="member-links">
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>
      </form>
      </div>
    </div>
  )
}

export default ForgotPassword
