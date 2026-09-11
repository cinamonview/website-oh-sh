import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Archive() {
  const [archives, setArchives] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:8080/api/archives')
      .then((res) => {
        if (!res.ok) {
          throw new Error('자료실 목록 조회 실패')
        }
        return res.json()
      })
      .then((data) => {
        setArchives(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('자료실 목록 조회 에러:', err)
        setErrorMessage('자료실 목록을 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>자료실</h1>
        <p>자료실 목록을 불러오는 중...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
        <h1>자료실</h1>
        <p style={{ color: 'red' }}>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>자료실</h1>
        <Link to="/archive/write">글쓰기</Link>
      </div>

      {archives.length === 0 ? (
        <p>자료실 게시글이 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <Link to={`/archive/${archive.id}`}>{archive.title}</Link>
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{archive.writer}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{archive.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Archive