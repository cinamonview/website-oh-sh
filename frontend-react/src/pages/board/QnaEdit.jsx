import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function QnaEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8080/api/qnas/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Q&A 게시글 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setFormData({
          title: data.title || '',
          content: data.content || '',
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Q&A 수정 대상 조회 에러:', err)
        setErrorMessage('Q&A 게시글을 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [id])

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

    fetch(`http://localhost:8080/api/qnas/${id}`, {
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
          throw new Error('Q&A 게시글 수정 실패')
        }
        return res.json()
      })
      .then(() => {
        navigate(`/qna/${id}`)
      })
      .catch((err) => {
        console.error('Q&A 게시글 수정 에러:', err)
        setErrorMessage('Q&A 게시글을 수정하지 못했습니다.')
        setSaving(false)
      })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>Q&A 게시글 수정</h1>
        <p>Q&A 게시글을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1>Q&A 게시글 수정</h1>
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

        {saving && <p>Q&A 게시글을 수정하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={saving} style={{ padding: '8px 16px', cursor: saving ? 'not-allowed' : 'pointer' }}>
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
