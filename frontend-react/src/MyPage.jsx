import { useState, useEffect } from 'react'

function MyPage() {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // 수정 모드 상태 및 폼 데이터
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [saving, setSaving] = useState(false)
  const [updateError, setUpdateError] = useState('')

  // 비밀번호 변경 모드 상태
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  useEffect(() => {
    fetch('http://localhost:8080/api/members/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json().then((data) => {
            setMember(data)
            setLoading(false)
          })
        } else if (res.status === 401) {
          setErrorMessage('로그인이 필요합니다.')
          setLoading(false)
        } else {
          setErrorMessage('회원 정보를 불러오지 못했습니다.')
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('회원 정보 조회 에러:', err)
        setErrorMessage('회원 정보를 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [])

  // 수정 모드 진입
  const handleStartEdit = () => {
    setFormData({
      name: member?.name || '',
      email: member?.email || '',
      phone: member?.phone || '',
    })
    setUpdateError('')
    setIsEditing(true)
  }

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false)
    setUpdateError('')
  }

  // 폼 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 수정 내용 저장
  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setUpdateError('')

    fetch('http://localhost:8080/api/members/me', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json().then((data) => {
            setMember(data)
            setIsEditing(false)
            setSaving(false)
          })
        } else if (res.status === 401) {
          setUpdateError('로그인이 필요합니다.')
          setSaving(false)
        } else {
          setUpdateError('회원 정보를 수정하지 못했습니다.')
          setSaving(false)
        }
      })
      .catch((err) => {
        console.error('회원 정보 수정 에러:', err)
        setUpdateError('회원 정보를 수정하지 못했습니다.')
        setSaving(false)
      })
  }

  // 비밀번호 변경 모드 진입
  const handleStartChangePassword = () => {
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPwError('')
    setPwSuccess('')
    setIsChangingPassword(true)
  }

  // 비밀번호 변경 취소
  const handleCancelChangePassword = () => {
    setIsChangingPassword(false)
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPwError('')
    setPwSuccess('')
  }

  // 비밀번호 폼 입력 핸들러
  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm((prev) => ({ ...prev, [name]: value }))
  }

  // 비밀번호 변경 저장
  const handleSavePassword = (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setPwSaving(true)

    fetch('http://localhost:8080/api/members/password', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          setPwSuccess('비밀번호가 변경되었습니다.')
          setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
          setPwSaving(false)
          setIsChangingPassword(false)
        } else if (res.status === 400) {
          return res.json().then((data) => {
            setPwError(data.message || '현재 비밀번호가 올바르지 않습니다.')
            setPwSaving(false)
          })
        } else if (res.status === 401) {
          setPwError('로그인이 필요합니다.')
          setPwSaving(false)
        } else {
          setPwError('비밀번호를 변경하지 못했습니다.')
          setPwSaving(false)
        }
      })
      .catch((err) => {
        console.error('비밀번호 변경 에러:', err)
        setPwError('비밀번호를 변경하지 못했습니다.')
        setPwSaving(false)
      })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <h1>내 정보</h1>
        <p>회원 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <h1>내 정보</h1>
        <p style={{ color: 'red' }}>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>내 정보</h1>

      {isChangingPassword ? (
        <form onSubmit={handleSavePassword}>
          <h2 style={{ marginTop: '0', marginBottom: '16px', fontSize: '1.1rem' }}>비밀번호 변경</h2>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>현재 비밀번호</strong></label>
            <input
              type="password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>새 비밀번호</strong></label>
            <input
              type="password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>새 비밀번호 확인</strong></label>
            <input
              type="password"
              name="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          {pwError && (
            <p style={{ color: 'red', marginBottom: '12px' }}>{pwError}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={pwSaving}
              style={{ padding: '8px 16px', cursor: pwSaving ? 'not-allowed' : 'pointer' }}
            >
              {pwSaving ? '변경 중...' : '변경하기'}
            </button>
            <button
              type="button"
              onClick={handleCancelChangePassword}
              disabled={pwSaving}
              style={{ padding: '8px 16px', cursor: pwSaving ? 'not-allowed' : 'pointer' }}
            >
              취소
            </button>
          </div>
        </form>
      ) : isEditing ? (
        <form onSubmit={handleSave}>
          <p><strong>아이디:</strong> {member?.loginId}</p>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>이름:</strong></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>이메일:</strong></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>전화번호:</strong></label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          {updateError && (
            <p style={{ color: 'red', marginBottom: '12px' }}>{updateError}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '8px 16px', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              style={{ padding: '8px 16px', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <>
          <p><strong>아이디:</strong> {member?.loginId}</p>
          <p><strong>이름:</strong> {member?.name}</p>
          <p><strong>이메일:</strong> {member?.email}</p>
          <p><strong>전화번호:</strong> {member?.phone}</p>
          <p><strong>가입일:</strong> {member?.createdAt ? new Date(member.createdAt).toLocaleString() : '-'}</p>
          <p><strong>수정일:</strong> {member?.updatedAt ? new Date(member.updatedAt).toLocaleString() : '-'}</p>

          {pwSuccess && (
            <p style={{ color: 'green', marginTop: '8px' }}>{pwSuccess}</p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={handleStartEdit}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              회원정보 수정
            </button>
            <button
              onClick={handleStartChangePassword}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              비밀번호 변경
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default MyPage
