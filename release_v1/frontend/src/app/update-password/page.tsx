'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from "@/components/ui/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequirementsMet) {
      setError('Please ensure all password requirements are met')
      return
    }

    setLoading(true)

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password
      })

      if (supabaseError) throw supabaseError

      toast({
        title: "Success",
        description: "Password updated successfully"
      })
      router.push('/login')
      
    } catch (error: any) {
      console.error('Update password error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const RequirementIcon = ({ met }: { met: boolean }) => (
    met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-300" />
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>Choose a password that meets the requirements below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !allRequirementsMet}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}