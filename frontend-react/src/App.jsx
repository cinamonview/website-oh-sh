function App() {

  const sendMember = () => {

    fetch('http://localhost:8080/api/test-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '홍길동',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
      })
  }

  return (
    <div>
      <h1>DB 저장 테스트</h1>

      <button onClick={sendMember}>
        회원 저장하기
      </button>
    </div>
  )
}

export default App