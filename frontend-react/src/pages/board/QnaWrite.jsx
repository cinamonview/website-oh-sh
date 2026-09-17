import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Qna.css'

function QnaWrite() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch('/api/members/session', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          navigate('/login')
          return
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('세션 확인 에러:', err)
        navigate('/login')
      })
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('제목과 내용을 입력해주세요.')
      return
    }

    setSaving(true)

    fetch('/api/qnas', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Q&A 게시글 등록 실패')
        }
        return res.json()
      })
      .then((data) => {
        navigate(`/qna/${data.id}`)
      })
      .catch((err) => {
        console.error('Q&A 게시글 등록 에러:', err)
        setErrorMessage('Q&A 게시글을 등록하지 못했습니다.')
        setSaving(false)
      })
  }

  if (loading) {
    return (
      <div className="qna-form-page">
        <h1>Q&A 게시글 작성</h1>
        <p>로그인 상태를 확인하는 중...</p>
      </div>
    )
  }

  return (
    <div className="qna-form-page">
      <div className="qna-form-header"><h1>Q&A 게시글 작성</h1></div>
      <form className="qna-form" onSubmit={handleSubmit}>
        <div className="qna-form-field">
          <label htmlFor="title" style={{ display: 'block', marginBottom: '4px' }}>제목</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={saving}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div className="qna-form-field">
          <label htmlFor="content" style={{ display: 'block', marginBottom: '4px' }}>내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            disabled={saving}
            rows={12}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {saving && <p>Q&A 게시글을 등록하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</p>}

        <div className="qna-form-actions">
          <button type="submit" disabled={saving}>
            등록
          </button>
          <Link to="/qna">목록으로</Link>
        </div>
      </form>
    </div>
  )
}

export default QnaWrite
