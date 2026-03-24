import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

interface FormInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  icon: LucideIcon
  defaultValue?: string
  onInput?: (value: string) => void
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon: Icon,
  defaultValue,
  onInput,
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="mb-4">
      <label className="block text-[0.78rem] font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center group">
        <span className="absolute left-3.5 text-gray-400 flex pointer-events-none transition-all duration-300 group-focus-within:text-black group-focus-within:scale-110">
          <Icon size={18} />
        </span>
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onInput={e => onInput?.((e.target as HTMLInputElement).value)}
          className="w-full py-3 px-3.5 pl-11 text-[0.88rem] text-black bg-gray-50 border-[1.5px] border-gray-200 rounded-xl outline-none transition-all duration-300
            placeholder:text-gray-400
            focus:border-black focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,10,10,0.05)]"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 bg-none border-none cursor-pointer text-gray-400 flex p-1 transition-colors hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default FormInput
