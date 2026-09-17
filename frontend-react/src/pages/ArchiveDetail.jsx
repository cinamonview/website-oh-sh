import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogg', 'mov', 'avi'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'])

function getAttachmentType(fileName) {
  if (!fileName) {
    return 'file'
  }

  const extensionIndex = fileName.lastIndexOf('.')
  if (extensionIndex < 0) {
    return 'file'
  }

  const extension = fileName.slice(extensionIndex + 1).toLowerCase()
  if (IMAGE_EXTENSIONS.has(extension)) {
    return 'image'
  }
  if (AUDIO_EXTENSIONS.has(extension)) {
    return 'audio'
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    return 'video'
  }
  return 'file'
}

function ArchiveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [archive, setArchive] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [loginId, setLoginId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const requestedArchiveIdRef = useRef(null)

  useEffect(() => {
    if (requestedArchiveIdRef.current === id) {
      return
    }

    requestedArchiveIdRef.current = id

    fetch(`http://localhost:8080/api/archives/${id}`, {
      credentials: 'include',
    })
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

  const handleLike = () => {
    fetch(`http://localhost:8080/api/archives/${id}/like`, {
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
          setArchive((prev) => ({
            ...prev,
            likeCount: data.likeCount ?? prev?.likeCount ?? 0,
          }))
        }
      })
      .catch((err) => {
        console.error('자료실 좋아요 에러:', err)
        setErrorMessage('좋아요 처리 중 오류가 발생했습니다.')
      })
  }

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
          if (res.status === 401) {
            throw new Error('로그인이 필요합니다.')
          }
          if (res.status === 403) {
            throw new Error('자료실 게시글을 삭제할 권한이 없습니다.')
          }
          if (res.status === 404) {
            throw new Error('자료실 게시글을 찾을 수 없습니다.')
          }
          throw new Error('자료실 게시글 삭제 실패')
        }
        navigate('/archive')
      })
      .catch((err) => {
        console.error('자료실 게시글 삭제 에러:', err)
        setErrorMessage(err.message)
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
        <p><strong>조회수:</strong> {archive.viewCount ?? 0}</p>
        <button
          type="button"
          onClick={handleLike}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          ❤️ 좋아요 {archive.likeCount ?? 0}
        </button>
      </div>
      <div style={{ padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
        {archive.content}
      </div>
      {attachments.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <strong>📎 첨부파일</strong>
          {attachments.map((attachment) => (
            <div key={attachment.id} style={{ marginTop: '8px' }}>
              {getAttachmentType(attachment.originalFileName) === 'image' && (
                <img
                  src={`http://localhost:8080/api/archives/files/${attachment.id}/preview`}
                  alt={attachment.originalFileName || '첨부 이미지'}
                  style={{ display: 'block', maxWidth: '100%' }}
                />
              )}
              {getAttachmentType(attachment.originalFileName) === 'video' && (
                <video
                  controls
                  preload="metadata"
                  src={`http://localhost:8080/api/archives/files/${attachment.id}/preview`}
                  style={{ display: 'block', maxWidth: '100%' }}
                />
              )}
              {getAttachmentType(attachment.originalFileName) === 'audio' && (
                <audio
                  controls
                  src={`http://localhost:8080/api/archives/files/${attachment.id}/preview`}
                />
              )}
              {getAttachmentType(attachment.originalFileName) === 'file' ? (
                <>
                  <a
                    href={`http://localhost:8080/api/archives/files/${attachment.id}/download`}
                    download
                  >
                    {attachment.originalFileName}
                  </a>{' '}
                  ({attachment.fileSize} bytes)
                </>
              ) : (
                <div>
                  {attachment.originalFileName} ({attachment.fileSize} bytes)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        {loginId === archive.writer && (
          <>
            <Link to={`/archive/${id}/edit`} style={{ marginRight: '10px' }}>수정</Link>
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ marginRight: '10px', padding: '4px 8px', cursor: deleting ? 'not-allowed' : 'pointer' }}>
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </>
        )}
        {deleting && <p>자료실 게시글을 삭제하는 중...</p>}
        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
        <Link to="/archive">목록으로</Link>
      </div>
    </div>
  )
}

export default ArchiveDetail