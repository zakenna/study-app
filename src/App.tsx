import { BrowserRouter, Link, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import CreatePage from './pages/CreatePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav className="menu">
        <Link to="/">홈</Link>
        <Link to="/quiz">퀴즈</Link>
        <Link to="/result">결과</Link>
        <Link to="/create">문제 만들기</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/create" element={<CreatePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
