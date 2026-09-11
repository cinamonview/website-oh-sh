import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function BoardEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8080/api/boards/${id}`),
      fetch('http://localhost:8080/api/members/session', {
        credentials: 'include',
      }),
    ])
      .then(async ([boardResponse, sessionResponse]) => {
        if (!sessionResponse.ok) {
          navigate('/login')
          return
        }

        const session = await sessionResponse.json()
        if (!session.loggedIn) {
          navigate('/login')
          return
        }

        if (boardResponse.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.')
        }
        if (!boardResponse.ok) {
          throw new Error('게시글 조회 실패')
        }

        const data = await boardResponse.json()
        if (data.writer !== session.loginId) {
          navigate(`/board/${id}`)
          return
        }

        setBoard(data)
        setFormData({
          title: data.title || '',
          content: data.content || '',
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('게시글 수정 대상 조회 에러:', err)
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

    fetch(`http://localhost:8080/api/boards/${id}`, {
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
            throw new Error('게시글을 수정할 권한이 없습니다.')
          }
          if (res.status === 404) {
            throw new Error('게시글을 찾을 수 없습니다.')
          }
          throw new Error('게시글 수정 실패')
        }
        return res.json()
      })
      .then(() => {
        navigate(`/board/${id}`)
      })
      .catch((err) => {
        console.error('게시글 수정 에러:', err)
        setErrorMessage(err.message)
        setSaving(false)
      })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>게시글 수정</h1>
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (!board) {
    return null
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1>게시글 수정</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
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

        <div style={{ marginBottom: '16px' }}>
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

        {saving && <p>게시글을 수정하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={saving} style={{ padding: '8px 16px', cursor: saving ? 'not-allowed' : 'pointer' }}>
            수정
          </button>
          <Link to={`/board/${id}`}>취소</Link>
          <Link to="/board">목록으로</Link>
        </div>
      </form>
    </div>
  )
}

export default BoardEdit
