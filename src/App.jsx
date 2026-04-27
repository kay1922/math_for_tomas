import { useState, useEffect, useCallback, useRef } from 'react'

const EMOJIS_CORRECT = ['🎉', '⭐', '🌟', '🦄', '🎈', '🍭', '🌈', '🎊', '🥳', '🐸']
const EMOJIS_WRONG   = ['😬', '🙈', '💪', '🤔', '😅']

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateQuestion() {
  const op = Math.random() < 0.5 ? '+' : '-'
  let a, b
  do {
    a = randomInt(1, 19)
    b = randomInt(1, 19)
  } while (op === '+' && a + b > 30)
  if (op === '-' && b > a) [a, b] = [b, a]
  if (op === '-' && a === b) b = randomInt(1, a)
  return { a, b, op, answer: op === '+' ? a + b : a - b }
}

export default function App() {
  const [question, setQuestion]   = useState(generateQuestion)
  const [input, setInput]         = useState('')
  const [score, setScore]         = useState(0)
  const [streak, setStreak]       = useState(0)
  const [bestStreak, setBest]     = useState(0)
  const [feedback, setFeedback]   = useState(null) // 'correct' | 'wrong'
  const [emoji, setEmoji]         = useState('')
  const [cardKey, setCardKey]     = useState(0)
  const [btnShake, setBtnShake]   = useState(false)
  const inputRef = useRef(null)

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  useEffect(() => { focusInput() }, [focusInput])

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion())
    setInput('')
    setFeedback(null)
    setEmoji('')
    setCardKey(k => k + 1)
    focusInput()
  }, [focusInput])

  const submit = useCallback(() => {
    const val = parseInt(input, 10)
    if (isNaN(val)) {
      setBtnShake(true)
      setTimeout(() => setBtnShake(false), 500)
      return
    }

    if (val === question.answer) {
      const e = EMOJIS_CORRECT[randomInt(0, EMOJIS_CORRECT.length - 1)]
      setEmoji(e)
      setFeedback('correct')
      setScore(s => s + 1)
      setStreak(s => {
        const next = s + 1
        setBest(b => Math.max(b, next))
        return next
      })
      setTimeout(nextQuestion, 1200)
    } else {
      const e = EMOJIS_WRONG[randomInt(0, EMOJIS_WRONG.length - 1)]
      setEmoji(e)
      setFeedback('wrong')
      setStreak(0)
      setTimeout(() => {
        setFeedback(null)
        setEmoji('')
        setInput('')
        focusInput()
      }, 1200)
    }
  }, [input, question.answer, nextQuestion, focusInput])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') submit()
  }, [submit])

  const handleDigit = useCallback((d) => {
    setInput(prev => {
      if (prev.length >= 2) return prev
      return prev + d
    })
    focusInput()
  }, [focusInput])

  const handleBackspace = useCallback(() => {
    setInput(prev => prev.slice(0, -1))
    focusInput()
  }, [focusInput])

  const bgClass = feedback === 'correct'
    ? 'bg-green-100 border-green-400'
    : feedback === 'wrong'
    ? 'bg-red-100 border-red-400'
    : 'bg-white border-yellow-300'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6"
         style={{ background: 'linear-gradient(135deg, #fef9ee 0%, #e0f2fe 100%)' }}>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-purple-600 drop-shadow-sm">Math Fun! 🎉</h1>
        <div className="flex gap-6 justify-center mt-2 text-lg font-bold text-gray-600">
          <span>⭐ Score: <span className="text-yellow-500">{score}</span></span>
          <span>🔥 Streak: <span className="text-orange-500">{streak}</span></span>
          <span>🏆 Best: <span className="text-purple-500">{bestStreak}</span></span>
        </div>
      </div>

      {/* Question card */}
      <div key={cardKey}
           className={`animate-bounce-in w-full max-w-sm rounded-3xl border-4 shadow-xl p-8 text-center transition-colors duration-300 ${bgClass}`}>

        {feedback && (
          <div className="text-7xl mb-4 animate-pop">{emoji}</div>
        )}

        {!feedback && (
          <>
            <div className="text-7xl font-black text-gray-800 tracking-wider mb-6">
              {question.a} <span className={question.op === '+' ? 'text-green-500' : 'text-red-500'}>{question.op}</span> {question.b} = ?
            </div>

            {/* Answer display */}
            <div className="text-6xl font-black text-purple-700 h-16 flex items-center justify-center mb-4
                            border-b-4 border-purple-300 mx-8">
              {input || <span className="text-gray-300">__</span>}
            </div>

            {/* Hidden real input for keyboard */}
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={input}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                setInput(v)
              }}
              onKeyDown={handleKey}
              className="opacity-0 absolute w-0 h-0"
              aria-label="Your answer"
            />

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1,2,3,4,5,6,7,8,9].map(d => (
                <button key={d}
                  onClick={() => handleDigit(String(d))}
                  className="rounded-2xl bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-3xl font-black
                             text-gray-800 py-4 shadow-md transition-transform">
                  {d}
                </button>
              ))}
              <button onClick={handleBackspace}
                className="rounded-2xl bg-gray-200 hover:bg-gray-300 active:scale-95 text-2xl font-black
                           text-gray-600 py-4 shadow-md transition-transform col-span-1">
                ⌫
              </button>
              <button onClick={() => handleDigit('0')}
                className="rounded-2xl bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-3xl font-black
                           text-gray-800 py-4 shadow-md transition-transform">
                0
              </button>
              <button onClick={submit}
                className={`rounded-2xl bg-green-400 hover:bg-green-500 active:scale-95 text-2xl font-black
                           text-white py-4 shadow-md transition-transform ${btnShake ? 'animate-shake' : ''}`}>
                ✓
              </button>
            </div>
          </>
        )}

        {feedback === 'correct' && (
          <div className="text-3xl font-black text-green-600">Well done! 🌟</div>
        )}
        {feedback === 'wrong' && (
          <div className="text-3xl font-black text-red-500">
            Try again! 💪<br/>
            <span className="text-xl text-gray-500">Answer: {question.answer}</span>
          </div>
        )}
      </div>

      {/* Motivation bar */}
      {streak >= 3 && (
        <div className="text-2xl font-black text-orange-500 animate-bounce">
          🔥 {streak} in a row! Amazing!
        </div>
      )}
    </div>
  )
}
