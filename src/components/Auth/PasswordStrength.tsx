import * as React from 'react'

// 静态正则表达式，避免每次调用时重新编译
const HAS_UPPERCASE = /[A-Z]/
const HAS_LOWERCASE = /[a-z]/
const HAS_DIGIT = /\d/
const HAS_SPECIAL = /[^A-Z0-9]/i

interface PasswordStrengthProps {
  password: string
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (val: string): { score: number, level: string } => {
    if (!val)
      return { score: 0, level: '' }

    let score = 0
    if (val.length >= 4)
      score++
    if (val.length >= 8)
      score++
    if (HAS_UPPERCASE.test(val) && HAS_LOWERCASE.test(val))
      score++
    if (HAS_DIGIT.test(val) && HAS_SPECIAL.test(val))
      score++

    const level = score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong'
    return { score, level }
  }

  const { score, level } = getStrength(password)

  const getBarColor = (index: number) => {
    if (index >= score)
      return 'bg-gray-200'
    switch (level) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-amber-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-200'
    }
  }

  return (
    <div className="flex gap-1 mt-2 h-0.75">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`flex-1 rounded-xs transition-all duration-300 origin-left ${getBarColor(i)}`}
        />
      ))}
    </div>
  )
}

export default PasswordStrength
