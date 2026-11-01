// src/pages/Login.tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Notification } from '../components/ui/Notification'

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type FormData = z.infer<typeof schema>

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const [errorMsg, setErrorMsg] = useState<string>('')

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-6 rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {errorMsg && <Notification type="error" message={errorMsg} />}
        <Input
          id="email"
          type="email"
          label="Email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? 'Logging in…' : 'Login'}
        </Button>
      </form>
    </div>
  )
}

export default Login
