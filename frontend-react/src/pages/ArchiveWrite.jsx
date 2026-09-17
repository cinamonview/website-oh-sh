import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Archive.css'

function ArchiveWrite() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('제목과 내용을 입력해주세요.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/archives', {
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

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login')
          return
        }
        throw new Error('자료실 게시글 등록 실패')
      }

      const data = await response.json()

      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedFile)
        uploadFormData.append('archiveId', data.id)

        const uploadResponse = await fetch('/api/archives/upload', {
          method: 'POST',
          credentials: 'include',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 401) {
            navigate('/login')
            return
          }
          throw new Error('파일 업로드 실패')
        }
      }

      navigate(`/archive/${data.id}`)
    } catch (err) {
      console.error('자료실 게시글 또는 파일 업로드 에러:', err)
      setErrorMessage(err.message === '파일 업로드 실패'
        ? '게시글은 등록되었지만 파일을 업로드하지 못했습니다.'
        : '자료실 게시글을 등록하지 못했습니다.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="archive-form-page">
        <h1>자료실 게시글 작성</h1>
        <p>로그인 상태를 확인하는 중...</p>
      </div>
    )
  }

  return (
    <div className="archive-form-page">
      <div className="archive-form-header"><h1>자료실 게시글 작성</h1></div>
      <form className="archive-form" onSubmit={handleSubmit}>
        <div className="archive-form-field">
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

        <div className="archive-form-field">
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

        <div className="archive-form-field">
          <label htmlFor="attachment" style={{ display: 'block', marginBottom: '4px' }}>첨부파일</label>
          <input
            id="attachment"
            type="file"
            onChange={handleFileChange}
            disabled={saving}
            className="archive-file-input"
          />
        </div>

        {saving && <p>자료실 게시글을 등록하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</p>}

        <div className="archive-form-actions">
          <button type="submit" disabled={saving}>
            등록
          </button>
          <Link to="/archive">목록으로</Link>
        </div>
      </form>
    </div>
  )
}

export default ArchiveWrite