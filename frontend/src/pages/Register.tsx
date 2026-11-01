// src/pages/Register.tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useNotification } from '../context/NotificationContext'


const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  displayName: z.string().min(1, { message: 'Display name is required' }),
})

type FormData = z.infer<typeof schema>

function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })


  const { addNotification } = useNotification();
  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.password, data.displayName);
      navigate('/');
    } catch (e: any) {
      addNotification('error', e.message || 'Registration failed');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-6 rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <Input
          id="displayName"
          type="text"
          label="Display Name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
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
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isSubmitting ? 'Registering…' : 'Register'}
        </Button>
      </form>
    </div>
  )
}

export default Register
