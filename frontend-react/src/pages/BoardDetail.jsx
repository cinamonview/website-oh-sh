import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function BoardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8080/api/boards/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('게시글 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setBoard(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('게시글 상세 조회 에러:', err)
        setErrorMessage('게시글을 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [id])

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    setDeleting(true)
    setErrorMessage('')

    fetch(`http://localhost:8080/api/boards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('게시글 삭제 실패')
        }
        navigate('/board')
      })
      .catch((err) => {
        console.error('게시글 삭제 에러:', err)
        setErrorMessage('게시글을 삭제하지 못했습니다.')
        setDeleting(false)
      })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>게시글 상세</h1>
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage || !board) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>게시글 상세</h1>
        <p style={{ color: 'red' }}>{errorMessage || '게시글을 찾을 수 없습니다.'}</p>
        <Link to="/board">목록으로</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1>{board.title}</h1>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>작성자:</strong> {board.writer}</p>
        <p><strong>작성일:</strong> {board.createdAt}</p>
        <p><strong>수정일:</strong> {board.updatedAt}</p>
      </div>
      <div style={{ padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
        {board.content}
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to={`/board/${id}/edit`} style={{ marginRight: '10px' }}>수정</Link>
        <button type="button" onClick={handleDelete} disabled={deleting} style={{ marginRight: '10px', padding: '4px 8px', cursor: deleting ? 'not-allowed' : 'pointer' }}>
          {deleting ? '삭제 중...' : '삭제'}
        </button>
        <Link to="/board">목록으로</Link>
      </div>
    </div>
  )
}

export default BoardDetail
