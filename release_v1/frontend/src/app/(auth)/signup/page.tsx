'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from "@/components/ui/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Eye, EyeOff, Check, X } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Password validation criteria
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  }

  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword)
  const allRequirementsMet = Object.values(requirements).every(Boolean) && passwordsMatch

  const RequirementIcon = ({ met }: { met: boolean }) => (
    met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-300" />
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequirementsMet) {
      setError('Please ensure all password requirements are met')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await signUp(email, password, username)
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email to confirm your account before logging in.",
        action: (
          <ToastAction altText="Go to login">Go to login</ToastAction>
        ),
      })
      
      router.push('/login')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up for a new account. Passwords must meet the requirements below.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <RequirementIcon met={requirements.minLength} />
                  <span>8+ characters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RequirementIcon met={requirements.hasUppercase} />
                  <span>Uppercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RequirementIcon met={requirements.hasLowercase} />
                  <span>Lowercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RequirementIcon met={requirements.hasNumber} />
                  <span>Number</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RequirementIcon met={requirements.hasSpecial} />
                  <span>Special character</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RequirementIcon met={passwordsMatch} />
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !allRequirementsMet}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}