import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('로딩 중...')

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => setMessage('에러 발생: ' + err.message))
  }, [])

  return (
    <div>
      <h1>서버 응답:</h1>
      <p>{message}</p>
    </div>
  )
}

export default App