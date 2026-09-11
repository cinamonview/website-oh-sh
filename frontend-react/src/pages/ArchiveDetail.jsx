import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function ArchiveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [archive, setArchive] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8080/api/archives/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('자료실 게시글 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setArchive(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('자료실 게시글 상세 조회 에러:', err)
        setErrorMessage('자료실 게시글을 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    fetch(`http://localhost:8080/api/archives/${id}/files`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('첨부파일 목록 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setAttachments(data)
      })
      .catch((err) => {
        console.error('자료실 첨부파일 목록 조회 에러:', err)
        setAttachments([])
      })
  }, [id])

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    setDeleting(true)
    setErrorMessage('')

    fetch(`http://localhost:8080/api/archives/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('자료실 게시글 삭제 실패')
        }
        navigate('/archive')
      })
      .catch((err) => {
        console.error('자료실 게시글 삭제 에러:', err)
        setErrorMessage('자료실 게시글을 삭제하지 못했습니다.')
        setDeleting(false)
      })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>자료실 게시글 상세</h1>
        <p>자료실 게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage || !archive) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>자료실 게시글 상세</h1>
        <p style={{ color: 'red' }}>{errorMessage || '자료실 게시글을 찾을 수 없습니다.'}</p>
        <Link to="/archive">목록으로</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1>{archive.title}</h1>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>작성자:</strong> {archive.writer}</p>
        <p><strong>작성일:</strong> {archive.createdAt}</p>
        <p><strong>수정일:</strong> {archive.updatedAt}</p>
      </div>
      <div style={{ padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
        {archive.content}
      </div>
      {attachments.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <strong>📎 첨부파일</strong>
          {attachments.map((attachment) => (
            <div key={attachment.id} style={{ marginTop: '8px' }}>
              <a
                href={`http://localhost:8080/api/archives/files/${attachment.id}/download`}
                download
              >
                {attachment.originalFileName}
              </a>{' '}
              ({attachment.fileSize} bytes)
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <Link to={`/archive/${id}/edit`} style={{ marginRight: '10px' }}>수정</Link>
        <button type="button" onClick={handleDelete} disabled={deleting} style={{ marginRight: '10px', padding: '4px 8px', cursor: deleting ? 'not-allowed' : 'pointer' }}>
          {deleting ? '삭제 중...' : '삭제'}
        </button>
        <Link to="/archive">목록으로</Link>
      </div>
    </div>
  )
}

export default ArchiveDetail