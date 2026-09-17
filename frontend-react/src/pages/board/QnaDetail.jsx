import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function formatDate(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? dateValue : date.toLocaleString()
}

function QnaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qna, setQna] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentError, setCommentError] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [loginId, setLoginId] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentActionId, setCommentActionId] = useState(null)
  const requestedQnaIdRef = useRef(null)

  useEffect(() => {
    if (requestedQnaIdRef.current === id) {
      return
    }

    requestedQnaIdRef.current = id

    fetch(`http://localhost:8080/api/qnas/${id}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Q&A 게시글 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setQna(data)
        setLoading(false)

        return fetch(`http://localhost:8080/api/qnas/${id}/comments`, {
          credentials: 'include',
        })
          .then((commentsResponse) => {
            if (!commentsResponse.ok) {
              throw new Error('댓글 목록 조회 실패')
            }
            return commentsResponse.json()
          })
          .then((commentData) => {
            setComments(commentData)
            setCommentsLoading(false)
          })
      })
      .catch((err) => {
        if (err.message === '댓글 목록 조회 실패') {
          console.error('댓글 목록 조회 에러:', err)
          setCommentError('댓글을 불러오지 못했습니다.')
          setCommentsLoading(false)
          return
        }

        console.error('Q&A 상세 조회 에러:', err)
        setErrorMessage('Q&A 게시글을 불러오지 못했습니다.')
        setLoading(false)
      })

    fetch('http://localhost:8080/api/members/session', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setLoginId(data.loggedIn ? data.loginId : null)
      })
      .catch((err) => {
        console.error('댓글 작성자 세션 확인 에러:', err)
        setLoginId(null)
      })
  }, [id])

  const reloadComments = () => {
    return fetch(`http://localhost:8080/api/qnas/${id}/comments`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('댓글 목록 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setComments(data)
        setCommentError('')
      })
  }

  const handleLike = () => {
    fetch(`http://localhost:8080/api/qnas/${id}/like`, {
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
          setQna((prev) => ({
            ...prev,
            likeCount: data.likeCount ?? prev?.likeCount ?? 0,
          }))
        }
      })
      .catch((err) => {
        console.error('Q&A 좋아요 에러:', err)
        setCommentError('좋아요 처리 중 오류가 발생했습니다.')
      })
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()

    if (!loginId) {
      setCommentError('로그인 후 댓글을 작성할 수 있습니다.')
      return
    }

    if (!commentContent.trim()) {
      setCommentError('댓글 내용을 입력해주세요.')
      return
    }

    setCommentSubmitting(true)
    setCommentError('')

    fetch(`http://localhost:8080/api/qnas/${id}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentContent,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login')
            return null
          }
          throw new Error('댓글 등록 실패')
        }
        return reloadComments()
      })
      .then((result) => {
        if (result !== null) {
          setCommentContent('')
        }
      })
      .catch((err) => {
        console.error('댓글 등록 에러:', err)
        setCommentError('댓글을 등록하지 못했습니다.')
      })
      .finally(() => {
        setCommentSubmitting(false)
      })
  }

  const handleCommentEdit = (comment) => {
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
    setCommentError('')
  }

  const handleCommentUpdate = (commentId) => {
    if (!editingContent.trim()) {
      setCommentError('댓글 내용을 입력해주세요.')
      return
    }

    setCommentActionId(commentId)
    setCommentError('')

    fetch(`http://localhost:8080/api/comments/${commentId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: editingContent }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login')
            return null
          }
          if (res.status === 403) {
            throw new Error('댓글을 수정할 권한이 없습니다.')
          }
          if (res.status === 404) {
            throw new Error('댓글을 찾을 수 없습니다.')
          }
          throw new Error('댓글 수정 실패')
        }
        return reloadComments()
      })
      .then((result) => {
        if (result !== null) {
          setEditingCommentId(null)
          setEditingContent('')
        }
      })
      .catch((err) => {
        console.error('댓글 수정 에러:', err)
        setCommentError(err.message || '댓글을 수정하지 못했습니다.')
      })
      .finally(() => {
        setCommentActionId(null)
      })
  }

  const handleCommentDelete = (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) {
      return
    }

    setCommentActionId(commentId)
    setCommentError('')

    fetch(`http://localhost:8080/api/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login')
            return null
          }
          if (res.status === 403) {
            throw new Error('댓글을 삭제할 권한이 없습니다.')
          }
          if (res.status === 404) {
            throw new Error('댓글을 찾을 수 없습니다.')
          }
          throw new Error('댓글 삭제 실패')
        }
        return reloadComments()
      })
      .catch((err) => {
        console.error('댓글 삭제 에러:', err)
        setCommentError(err.message || '댓글을 삭제하지 못했습니다.')
      })
      .finally(() => {
        setCommentActionId(null)
      })
  }

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    setDeleting(true)
    setErrorMessage('')

    fetch(`http://localhost:8080/api/qnas/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('로그인이 필요합니다.')
          }
          if (res.status === 403) {
            throw new Error('Q&A 게시글을 삭제할 권한이 없습니다.')
          }
          throw new Error('Q&A 게시글 삭제 실패')
        }
        navigate('/qna')
      })
      .catch((err) => {
        console.error('Q&A 게시글 삭제 에러:', err)
        setErrorMessage(err.message)
        setDeleting(false)
      })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>Q&A 게시글 상세</h1>
        <p>Q&A 게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage || !qna) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>Q&A 게시글 상세</h1>
        <p style={{ color: 'red' }}>{errorMessage || 'Q&A 게시글을 찾을 수 없습니다.'}</p>
        <Link to="/qna">목록으로</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h1>{qna.title}</h1>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>작성자:</strong> {qna.writer}</p>
        <p><strong>작성일:</strong> {formatDate(qna.createdAt)}</p>
        <p><strong>수정일:</strong> {formatDate(qna.updatedAt)}</p>
        <p><strong>조회수:</strong> {qna.viewCount ?? 0}</p>
        <button
          type="button"
          onClick={handleLike}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          ❤️ 좋아요 {qna.likeCount ?? 0}
        </button>
      </div>
      <div style={{ padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
        {qna.content}
      </div>
      <div style={{ marginTop: '20px' }}>
        {loginId === qna.writer && (
          <>
            <Link to={`/qna/${id}/edit`} style={{ marginRight: '10px' }}>수정</Link>
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ marginRight: '10px', padding: '4px 8px', cursor: deleting ? 'not-allowed' : 'pointer' }}>
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </>
        )}
        {deleting && <p>Q&A 게시글을 삭제하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
        <Link to="/qna">목록으로</Link>
      </div>

      <section style={{ marginTop: '32px' }}>
        <h2>댓글</h2>

        {commentsLoading ? (
          <p>댓글을 불러오는 중...</p>
        ) : commentError && comments.length === 0 ? (
          <p style={{ color: 'red' }}>{commentError}</p>
        ) : comments.length === 0 ? (
          <p>등록된 댓글이 없습니다.</p>
        ) : (
          <div>
            {comments.map((comment) => (
              <div key={comment.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <p><strong>{comment.writer}</strong> · {formatDate(comment.createdAt)}</p>
                {editingCommentId === comment.id ? (
                  <div style={{ marginTop: '8px' }}>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      disabled={commentActionId === comment.id}
                      rows={3}
                      style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleCommentUpdate(comment.id)}
                        disabled={commentActionId === comment.id}
                        style={{ marginRight: '8px', padding: '4px 8px' }}
                      >
                        {commentActionId === comment.id ? '저장 중...' : '저장'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditingContent('')
                        }}
                        disabled={commentActionId === comment.id}
                        style={{ padding: '4px 8px' }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                )}
                {loginId === comment.writer && editingCommentId !== comment.id && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleCommentEdit(comment)}
                      disabled={commentActionId === comment.id}
                      style={{ marginRight: '8px', padding: '4px 8px' }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommentDelete(comment.id)}
                      disabled={commentActionId === comment.id}
                      style={{ padding: '4px 8px' }}
                    >
                      {commentActionId === comment.id ? '처리 중...' : '삭제'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {commentError && comments.length > 0 && <p style={{ color: 'red', marginTop: '10px' }}>{commentError}</p>}

        {loginId ? (
          <form onSubmit={handleCommentSubmit} style={{ marginTop: '20px' }}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={commentSubmitting}
              placeholder="댓글을 입력해주세요."
              rows={4}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <button type="submit" disabled={commentSubmitting} style={{ marginTop: '8px', padding: '8px 16px' }}>
              {commentSubmitting ? '등록 중...' : '댓글 등록'}
            </button>
          </form>
        ) : (
          <p style={{ marginTop: '20px' }}>로그인 후 댓글을 작성할 수 있습니다.</p>
        )}
      </section>
    </div>
  )
}

export default QnaDetail
