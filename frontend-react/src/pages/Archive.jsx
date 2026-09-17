import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Archive.css'

function Archive() {
  const [archives, setArchives] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8080/api/archives?page=${currentPage}&size=10`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('자료실 목록 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setArchives(data.content || [])
        setTotalPages(data.totalPages || 0)
        setLoading(false)
      })
      .catch((err) => {
        console.error('자료실 목록 조회 에러:', err)
        setErrorMessage('자료실 목록을 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [currentPage])

  if (loading) {
    return (
      <div className="board-page">
        <h1>자료실</h1>
        <p>자료실 목록을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="board-page">
        <h1>자료실</h1>
        <p style={{ color: 'red' }}>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="board-page">
      <div className="board-page-header">
        <h1 style={{ margin: 0 }}>자료실</h1>
        <Link className="board-action-link" to="/archive/write">글쓰기</Link>
      </div>

      {archives.length === 0 ? (
        <p className="board-empty">자료실 게시글이 없습니다.</p>
      ) : (
        <>
          <div className="board-table-wrap">
            <table className="board-table">
            <thead>
              <tr>
                <th style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>번호</th>
                <th style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>제목</th>
                <th style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>작성자</th>
                <th style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              {archives.map((archive) => (
                <tr key={archive.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{archive.id}</td>
                  <td className="board-title-cell" style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <Link to={`/archive/${archive.id}`}>{archive.title}</Link>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{archive.writer}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{archive.createdAt}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          <div className="board-pagination">
            <button type="button" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
              이전
            </button>
            {Array.from({ length: totalPages }, (_, index) => index).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                disabled={currentPage === pageNumber}
                className={currentPage === pageNumber ? 'board-page-current' : ''}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button type="button" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1 || totalPages === 0}>
              다음
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Archive