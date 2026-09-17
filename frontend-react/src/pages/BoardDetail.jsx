import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './Board.css'

function BoardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard] = useState(null)
  const [loginId, setLoginId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const requestedBoardIdRef = useRef(null)

  useEffect(() => {
    if (requestedBoardIdRef.current === id) {
      return
    }

    requestedBoardIdRef.current = id

    fetch(`http://localhost:8080/api/boards/${id}`, {
      credentials: 'include',
    })
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

  useEffect(() => {
    fetch('http://localhost:8080/api/members/session', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setLoginId(data.loggedIn ? data.loginId : null)
      })
      .catch((err) => {
        console.error('세션 확인 에러:', err)
        setLoginId(null)
      })
  }, [])

  const handleLike = () => {
    fetch(`http://localhost:8080/api/boards/${id}/like`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login')
          return null
        }
        if (!res.ok) {
          throw new Error('좋아요 처리 실패')
        }
        return res.json()
      })
      .then((data) => {
        if (data) {
          setBoard((prev) => ({
            ...prev,
            likeCount: data.likeCount ?? prev?.likeCount ?? 0,
          }))
        }
      })
      .catch((err) => {
        console.error('게시글 좋아요 에러:', err)
        setErrorMessage('좋아요 처리 중 오류가 발생했습니다.')
      })
  }

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
          if (res.status === 401) {
            throw new Error('로그인이 필요합니다.')
          }
          if (res.status === 403) {
            throw new Error('게시글을 삭제할 권한이 없습니다.')
          }
          throw new Error('게시글 삭제 실패')
        }
        navigate('/board')
      })
      .catch((err) => {
        console.error('게시글 삭제 에러:', err)
        setErrorMessage(err.message)
        setDeleting(false)
      })
  }

  if (loading) {
    return (
      <div className="board-detail-page">
        <h1>게시글 상세</h1>
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage || !board) {
    return (
      <div className="board-detail-page">
        <h1>게시글 상세</h1>
        <p style={{ color: 'red' }}>{errorMessage || '게시글을 찾을 수 없습니다.'}</p>
        <Link to="/board">목록으로</Link>
      </div>
    )
  }

  return (
    <div className="board-detail-page">
      <div className="board-detail-header">
        <h1>{board.title}</h1>
        <div className="board-detail-meta">
          <span><strong>작성자:</strong> {board.writer}</span>
          <span><strong>작성일:</strong> {board.createdAt}</span>
          <span><strong>수정일:</strong> {board.updatedAt}</span>
          <span><strong>조회수:</strong> {board.viewCount ?? 0}</span>
        </div>
        <button
          className="board-like-button"
          type="button"
          onClick={handleLike}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          ❤️ 좋아요 {board.likeCount ?? 0}
        </button>
      </div>
      <div className="board-content">
        {board.content}
      </div>
      <div className="board-detail-actions">
        {loginId === board.writer && (
          <>
            <Link className="board-action-link" to={`/board/${id}/edit`}>수정</Link>
            <button className="board-delete-button" type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </>
        )}
        <Link className="board-list-link" to="/board">목록으로</Link>
      </div>
    </div>
  )
}

export default BoardDetail
