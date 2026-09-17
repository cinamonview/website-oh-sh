import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './Qna.css'

function QnaEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [qna, setQna] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/qnas/${id}`),
      fetch('/api/members/session', {
        credentials: 'include',
      }),
    ])
      .then(async ([qnaResponse, sessionResponse]) => {
        if (!sessionResponse.ok) {
          navigate('/login')
          return
        }

        const session = await sessionResponse.json()
        if (!session.loggedIn) {
          navigate('/login')
          return
        }

        if (qnaResponse.status === 404) {
          throw new Error('Q&A 게시글을 찾을 수 없습니다.')
        }
        if (!qnaResponse.ok) {
          throw new Error('Q&A 게시글 조회 실패')
        }

        const data = await qnaResponse.json()
        if (data.writer !== session.loginId) {
          navigate(`/qna/${id}`)
          return
        }

        setQna(data)
        setFormData({
          title: data.title || '',
          content: data.content || '',
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Q&A 수정 대상 조회 에러:', err)
        setErrorMessage(err.message)
        setLoading(false)
      })
  }, [id, navigate])

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

    fetch(`/api/qnas/${id}`, {
      method: 'PUT',
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
          if (res.status === 401) {
            throw new Error('로그인이 필요합니다.')
          }
          if (res.status === 403) {
            throw new Error('Q&A 게시글을 수정할 권한이 없습니다.')
          }
          if (res.status === 404) {
            throw new Error('Q&A 게시글을 찾을 수 없습니다.')
          }
          throw new Error('Q&A 게시글 수정 실패')
        }
        return res.json()
      })
      .then(() => {
        navigate(`/qna/${id}`)
      })
      .catch((err) => {
        console.error('Q&A 게시글 수정 에러:', err)
        setErrorMessage(err.message)
        setSaving(false)
      })
  }

  if (loading) {
    return (
      <div className="qna-form-page">
        <h1>Q&A 게시글 수정</h1>
        <p>Q&A 게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (!qna) {
    return null
  }

  return (
    <div className="qna-form-page">
      <div className="qna-form-header"><h1>Q&A 게시글 수정</h1></div>
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

        {saving && <p>Q&A 게시글을 수정하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</p>}

        <div className="qna-form-actions">
          <button type="submit" disabled={saving}>
            수정
          </button>
          <Link to={`/qna/${id}`}>취소</Link>
          <Link to="/qna">목록으로</Link>
        </div>
      </form>
    </div>
  )
}

export default QnaEdit
