import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './Archive.css'

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

    fetch(`/api/archives/${id}`, {
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
    fetch('/api/members/session', {
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
    fetch(`/api/archives/${id}/files`)
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
    fetch(`/api/archives/${id}/like`, {
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

    fetch(`/api/archives/${id}`, {
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
      <div className="archive-detail-page">
        <h1>자료실 게시글 상세</h1>
        <p>자료실 게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage || !archive) {
    return (
      <div className="archive-detail-page">
        <h1>자료실 게시글 상세</h1>
        <p style={{ color: 'red' }}>{errorMessage || '자료실 게시글을 찾을 수 없습니다.'}</p>
        <Link to="/archive">목록으로</Link>
      </div>
    )
  }

  return (
    <div className="archive-detail-page">
      <div className="archive-detail-header">
        <h1>{archive.title}</h1>
        <div className="archive-detail-meta">
          <span><strong>작성자:</strong> {archive.writer}</span>
          <span><strong>작성일:</strong> {archive.createdAt}</span>
          <span><strong>수정일:</strong> {archive.updatedAt}</span>
          <span><strong>조회수:</strong> {archive.viewCount ?? 0}</span>
        </div>
        <button
          className="archive-like-button"
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
      <div className="archive-content">
        {archive.content}
      </div>
      {attachments.length > 0 && (
        <div className="archive-attachments">
          <strong className="archive-attachments-title">📎 첨부파일</strong>
          {attachments.map((attachment) => (
            <div className="archive-attachment" key={attachment.id}>
              {getAttachmentType(attachment.originalFileName) === 'image' && (
                <img
                  className="archive-preview-image"
                  src={`/api/archives/files/${attachment.id}/preview`}
                  alt={attachment.originalFileName || '첨부 이미지'}
                />
              )}
              {getAttachmentType(attachment.originalFileName) === 'video' && (
                <video
                  className="archive-preview-video"
                  controls
                  preload="metadata"
                  src={`/api/archives/files/${attachment.id}/preview`}
                />
              )}
              {getAttachmentType(attachment.originalFileName) === 'audio' && (
                <audio
                  className="archive-preview-audio"
                  controls
                  src={`/api/archives/files/${attachment.id}/preview`}
                />
              )}
              {getAttachmentType(attachment.originalFileName) === 'file' ? (
                <>
                  <a
                    className="archive-download-link"
                    href={`/api/archives/files/${attachment.id}/download`}
                    download
                  >
                    {attachment.originalFileName}
                  </a>
                  <span className="archive-attachment-name">({attachment.fileSize} bytes)</span>
                </>
              ) : (
                <div className="archive-attachment-name">
                  {attachment.originalFileName} ({attachment.fileSize} bytes)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="archive-detail-actions">
        {loginId === archive.writer && (
          <>
            <Link to={`/archive/${id}/edit`}>수정</Link>
            <button className="archive-delete-button" type="button" onClick={handleDelete} disabled={deleting}>
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