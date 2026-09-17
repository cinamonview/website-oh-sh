import { useState } from 'react'
import './Member.css'

function Register() {
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    phone: '',
  })

  // 아이디 중복확인 상태 및 메시지 관리
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [checkedId, setCheckedId] = useState('')
  const [idMessage, setIdMessage] = useState('')
  const [isIdValid, setIsIdValid] = useState(false)

  // 비밀번호 일치 메시지 및 회원가입 결과 메시지
  const [passwordMessage, setPasswordMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')

  // 이메일 인증 상태
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [isEmailMessageValid, setIsEmailMessageValid] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailVerifying, setEmailVerifying] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 아이디를 수정하면 중복확인을 다시 해야 함
    if (name === 'loginId') {
      setIsIdChecked(false)
      setCheckedId('')
      setIdMessage('')
      setIsIdValid(false)
    }

    // 비밀번호 입력 시 불일치 메시지 초기화
    if (name === 'password' || name === 'passwordConfirm') {
      setPasswordMessage('')
    }

    // 이메일을 수정하면 인증을 다시 해야 함
    if (name === 'email') {
      setIsEmailVerified(false)
      setVerifiedEmail('')
      setEmailCodeSent(false)
      setEmailCode('')
      setEmailMessage('')
      setIsEmailMessageValid(false)
    }
  }

  // 1. 아이디 중복확인
  const handleCheckLoginId = () => {
    if (!formData.loginId.trim()) {
      alert('아이디를 입력해주세요.')
      return
    }

    fetch(`http://localhost:8080/api/members/check-login-id?loginId=${encodeURIComponent(formData.loginId)}`)
      .then((res) => res.json())
      .then((exists) => {
        setIsIdChecked(true)
        setCheckedId(formData.loginId)

        if (exists) {
          setIdMessage('이미 사용 중인 아이디입니다.')
          setIsIdValid(false)
        } else {
          setIdMessage('사용 가능한 아이디입니다.')
          setIsIdValid(true)
        }
      })
      .catch((err) => {
        console.error('아이디 중복확인 에러:', err)
        setIdMessage('중복확인 중 오류가 발생했습니다.')
      })
  }

  // 2. 이메일 인증번호 발송
  const handleSendEmailCode = () => {
    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.')
      return
    }
    setEmailSending(true)
    setEmailMessage('')
    setIsEmailMessageValid(false)

    fetch('http://localhost:8080/api/email/send-code', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmailCodeSent(true)
          setEmailMessage(data.message)
          setIsEmailMessageValid(true)
        } else {
          setEmailMessage(data.message || '인증번호 발송에 실패했습니다.')
          setIsEmailMessageValid(false)
        }
        setEmailSending(false)
      })
      .catch((err) => {
        console.error('인증번호 발송 에러:', err)
        setEmailMessage('인증번호 발송 중 오류가 발생했습니다.')
        setIsEmailMessageValid(false)
        setEmailSending(false)
      })
  }

  // 3. 인증번호 확인
  const handleVerifyEmailCode = () => {
    if (!emailCode.trim()) {
      alert('인증번호를 입력해주세요.')
      return
    }
    setEmailVerifying(true)
    setEmailMessage('')
    setIsEmailMessageValid(false)

    fetch('http://localhost:8080/api/email/verify-code', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: emailCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsEmailVerified(true)
          setVerifiedEmail(formData.email)
          setEmailMessage(data.message)
          setIsEmailMessageValid(true)
        } else {
          setIsEmailVerified(false)
          setEmailMessage(data.message || '인증번호가 올바르지 않습니다.')
          setIsEmailMessageValid(false)
        }
        setEmailVerifying(false)
      })
      .catch((err) => {
        console.error('인증번호 확인 에러:', err)
        setEmailMessage('인증번호 확인 중 오류가 발생했습니다.')
        setIsEmailMessageValid(false)
        setEmailVerifying(false)
      })
  }

  // 4. 회원가입 제출
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitMessage('')
    setPasswordMessage('')

    // 중복확인 검증
    if (!isIdChecked || !isIdValid || checkedId !== formData.loginId) {
      alert('아이디 중복확인을 완료해주세요.')
      return
    }

    // 비밀번호 일치 검증
    if (formData.password !== formData.passwordConfirm) {
      setPasswordMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    // 이메일 인증 검증
    if (!isEmailVerified || verifiedEmail !== formData.email) {
      alert('이메일 인증을 완료해주세요.')
      return
    }

    // 필수값 검증
    if (!formData.password || !formData.name || !formData.email || !formData.phone) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    // 회원가입 API 호출
    fetch('http://localhost:8080/api/members', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginId: formData.loginId,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('회원가입 실패')
        }
        return res.json()
      })
      .then((data) => {
        console.log('회원가입 성공:', data)
        setSubmitMessage('회원가입이 완료되었습니다.')
        alert('회원가입이 완료되었습니다.')
        // 폼 초기화
        setFormData({
          loginId: '',
          password: '',
          passwordConfirm: '',
          name: '',
          email: '',
          phone: '',
        })
        setIsIdChecked(false)
        setCheckedId('')
        setIdMessage('')
        setIsIdValid(false)
        setIsEmailVerified(false)
        setVerifiedEmail('')
        setEmailCodeSent(false)
        setEmailCode('')
        setEmailMessage('')
        setIsEmailMessageValid(false)
      })
      .catch((err) => {
        console.error('회원가입 에러:', err)
        setSubmitMessage('회원가입 처리 중 오류가 발생했습니다.')
      })
  }

  return (
    <div className="member-page">
      <div className="member-card">
      <h2>회원가입</h2>
      <form className="member-form" onSubmit={handleSubmit}>
        {/* 아이디 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>아이디:</label>
          <div className="member-inline-field">
            <input
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              required
              style={{ flex: 1, padding: '8px' }}
            />
            <button type="button" onClick={handleCheckLoginId} style={{ padding: '8px 12px' }}>
              중복확인
            </button>
          </div>
          {idMessage && (
            <p className={`member-message ${isIdValid ? 'member-message-success' : 'member-message-error'}`}>
              {idMessage}
            </p>
          )}
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

        {/* 비밀번호 확인 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>비밀번호 확인:</label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {passwordMessage && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'red' }}>
              {passwordMessage}
            </p>
          )}
        </div>

        {/* 이름 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>이름:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* 이메일 + 인증 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>이메일:</label>
          <div className="member-inline-field">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEmailVerified}
              style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={handleSendEmailCode}
              disabled={emailSending || isEmailVerified}
              style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
            >
              {emailSending ? '발송 중...' : emailCodeSent ? '재발송' : '인증번호 발송'}
            </button>
          </div>
          {emailCodeSent && !isEmailVerified && (
            <div className="member-inline-field">
              <input
                type="text"
                placeholder="인증번호 6자리"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                maxLength={6}
                style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={handleVerifyEmailCode}
                disabled={emailVerifying}
                style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
              >
                {emailVerifying ? '확인 중...' : '인증 확인'}
              </button>
            </div>
          )}
          {emailMessage && (
            <p className={`member-message ${isEmailMessageValid ? 'member-message-success' : 'member-message-error'}`}>
              {emailMessage}
            </p>
          )}
        </div>

        {/* 전화번호 */}
        <div className="member-field">
          <label style={{ display: 'block', marginBottom: '4px' }}>전화번호:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            placeholder="010-1234-5678"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* 회원가입 버튼 */}
        <button
          className="member-button member-button-full"
          type="submit"
          style={{ width: '100%', padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          회원가입
        </button>

        {/* 제출 결과 안내 */}
        {submitMessage && (
          <p className={`member-submit-message ${submitMessage.includes('완료') ? 'member-message-success' : 'member-message-error'}`}>
            {submitMessage}
          </p>
        )}
      </form>
      </div>
    </div>
  )
}

export default Register
