import { useState } from 'react'

function App() {
  const [result, setResult] = useState('')

  const sendData = () => {
    fetch('http://localhost:8080/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '홍길동',
        email: 'test@test.com',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setResult(data.message)
      })
      .catch((err) => {
        setResult('에러 발생: ' + err.message)
      })
  }

  return (
    <div>
      <h1>React → Spring Boot POST 테스트</h1>

      <button onClick={sendData}>
        데이터 보내기
      </button>

      <p>{result}</p>
    </div>
  )
}

export default App