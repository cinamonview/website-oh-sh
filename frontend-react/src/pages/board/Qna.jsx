import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Qna.css'

function formatDate(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? dateValue : date.toLocaleString()
}

function Qna() {
  const [qnas, setQnas] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8080/api/qnas?page=${currentPage}&size=10`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Q&A 목록 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setQnas(data.content || [])
        setTotalPages(data.totalPages || 0)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Q&A 목록 조회 에러:', err)
        setErrorMessage('Q&A 게시글을 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [currentPage])

  if (loading) {
    return (
      <div className="board-page">
        <h1>Q&A 게시판</h1>
        <p>Q&A 게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="board-page">
        <h1>Q&A 게시판</h1>
        <p style={{ color: 'red' }}>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="board-page">
      <div className="board-page-header">
        <h1 style={{ margin: 0 }}>Q&A 게시판</h1>
        <Link className="board-action-link" to="/qna/write">글쓰기</Link>
      </div>

      {qnas.length === 0 ? (
        <p className="board-empty">Q&A 게시글이 없습니다.</p>
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
              {qnas.map((qna) => (
                <tr key={qna.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{qna.id}</td>
                  <td className="board-title-cell" style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <Link to={`/qna/${qna.id}`}>{qna.title}</Link>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{qna.writer}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{formatDate(qna.createdAt)}</td>
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

export default Qna
