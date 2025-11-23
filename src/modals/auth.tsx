import React, { FC, useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { SignInInput, SignUpInput, signInSchema, signUpSchema } from '@/schema/auth'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { GoogleIcon, LoadingIcon, PasskeyIcon } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  trigger: React.ReactNode
  type: 'signIn' | 'signUp'
}

export const AuthModal: FC<AuthModalProps> = ({ trigger, type }) => {
  const router = useRouter()
  const [modalType, setModalType] = useState<typeof type>(type)
  const [isLoading, startLoading] = useTransition()
  const [socialLoading, startSocialLoading] = useTransition()

  const form = useForm<SignInInput | SignUpInput>({
    resolver: zodResolver(modalType === 'signIn' ? signInSchema : signUpSchema),
    defaultValues: {
      ...(modalType === 'signIn'
        ? { email: '', password: '' }
        : { name: '', email: '', password: '', confirmPassword: '' }),
    },
  })

  const hasSignUpErrors = (
    errors: unknown
  ): errors is { name?: { message: string }; confirmPassword?: { message: string } } => {
    return modalType === 'signUp'
  }

  React.useEffect(() => {
    form.reset({
      ...(modalType === 'signIn'
        ? { email: '', password: '' }
        : { name: '', email: '', password: '', confirmPassword: '' }),
    })
  }, [modalType, form])

  const onSubmit = async (values: SignInInput | SignUpInput) => {
    startLoading(async () => {
      try {
        if (modalType === 'signIn') {
          const { data: session, error } = await authClient.signIn.email({
            email: values.email,
            password: values.password,
          })

          if (error) {
            toast.error(error.message || 'Invalid email or password')
            return
          }

          if (session) {
            toast.success('Signed in successfully!')
            router.push('/discover')
          }
        } else {
          const signUpValues = values as SignUpInput
          const { data: session, error } = await authClient.signUp.email({
            email: signUpValues.email,
            password: signUpValues.password,
            name: signUpValues.name,
          })

          if (error) {
            const errorMessage = error.message?.toLowerCase() || ''
            if (
              errorMessage.includes('already') ||
              errorMessage.includes('exist') ||
              error.status === 422
            ) {
              toast.info('An account with this email already exists. Please sign in.')
              setModalType('signIn')
              return
            }
            toast.error(error.message || 'Failed to create account')
            return
          }

          if (session) {
            toast.success('Account created successfully!')
            router.push('/discover')
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again.', {
          description: error instanceof Error ? error.message : 'Please try again.',
        })
      }
    })
  }

  const handleOAuthSignIn = async (provider: 'google') => {
    try {
      startSocialLoading(async () => {
        await authClient.signIn.social({
          provider,
          callbackURL: '/discover',
        })
      })
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`)
      console.error(`OAuth ${provider} error:`, error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl p-3 sm:min-w-lg lg:min-w-5xl" showCloseButton={false}>
        <div className="grid h-full w-full grid-cols-[0.9fr_1fr] justify-center">
          <div className="hidden overflow-hidden rounded-xl lg:block">
            <Image
              src={'/assets/misc/auth-bg.png'}
              alt="Auth Background"
              width={500}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>

          <div
            className={cn(
              'col-span-2 space-y-10 px-4 py-4 lg:col-span-1 lg:px-6',
              modalType === 'signIn' && 'space-y-4'
            )}>
            <h2 className="text-center font-mono text-lg font-medium transition-all duration-300">
              {modalType === 'signIn'
                ? 'Welcome back. Sign in to access your saved recipes.'
                : 'Welcome. Sign up for free to browse & save over 1,500+ recipes.'}
            </h2>

            <div className="space-y-6 px-0 sm:px-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div
                    className={cn(
                      'transition-all duration-500 ease-in-out',
                      modalType === 'signUp'
                        ? 'max-h-20 translate-y-0 transform opacity-100'
                        : 'max-h-0 -translate-y-2 transform opacity-0'
                    )}>
                    {modalType === 'signUp' && (
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => {
                          const hasNameText = field.value && field.value.length > 0

                          return (
                            <FormItem>
                              <FormControl>
                                <InputGroup className="rounded-full px-2">
                                  <InputGroupInput
                                    placeholder="Full Name"
                                    type="text"
                                    disabled={isLoading}
                                    className="placeholder:text-neutral-600"
                                    {...field}
                                  />
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupText
                                      className={cn(
                                        'text-xs text-neutral-400 transition-all duration-300',
                                        hasSignUpErrors(form.formState.errors) &&
                                          form.formState.errors.name &&
                                          'text-red-500'
                                      )}>
                                      {hasSignUpErrors(form.formState.errors) &&
                                      form.formState.errors.name
                                        ? form.formState.errors.name.message
                                        : hasNameText
                                          ? 'Name'
                                          : 'e.g. John Doe'}
                                    </InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      const hasEmailText = field.value && field.value.length > 0

                      return (
                        <FormItem>
                          <FormControl>
                            <InputGroup className="rounded-full px-2">
                              <InputGroupInput
                                placeholder="Email"
                                type="email"
                                disabled={isLoading}
                                className="placeholder:text-neutral-600"
                                {...field}
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupText
                                  className={cn(
                                    'text-xs text-neutral-400 transition-all duration-300',
                                    form.formState.errors.email && 'text-red-500'
                                  )}>
                                  {form.formState.errors.email
                                    ? form.formState.errors.email.message
                                    : hasEmailText
                                      ? 'Email'
                                      : 'e.g. example@email.com'}
                                </InputGroupText>
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => {
                      const hasPasswordText = field.value && field.value.length > 0

                      return (
                        <FormItem>
                          <FormControl>
                            <InputGroup className="rounded-full px-2">
                              <InputGroupInput
                                placeholder="Password"
                                type="password"
                                disabled={isLoading}
                                className="placeholder:text-neutral-600"
                                {...field}
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupText
                                  className={cn(
                                    'text-xs text-neutral-400 transition-all duration-300',
                                    form.formState.errors.password && 'text-red-500'
                                  )}>
                                  {form.formState.errors.password
                                    ? form.formState.errors.password.message
                                    : hasPasswordText
                                      ? 'Password'
                                      : modalType === 'signIn'
                                        ? 'enter your password'
                                        : 'min 8 characters'}
                                </InputGroupText>
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />

                  <div
                    className={cn(
                      'transition-all duration-500 ease-in-out',
                      modalType === 'signUp'
                        ? 'max-h-20 translate-y-0 transform opacity-100'
                        : 'max-h-0 -translate-y-2 transform opacity-0'
                    )}>
                    {modalType === 'signUp' && (
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => {
                          const hasConfirmPasswordText = field.value && field.value.length > 0

                          return (
                            <FormItem>
                              <FormControl>
                                <InputGroup className="rounded-full px-2">
                                  <InputGroupInput
                                    placeholder="Confirm Password"
                                    type="password"
                                    disabled={isLoading}
                                    className="placeholder:text-neutral-600"
                                    {...field}
                                  />
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupText
                                      className={cn(
                                        'text-xs text-neutral-400 transition-all duration-300',
                                        hasSignUpErrors(form.formState.errors) &&
                                          form.formState.errors.confirmPassword &&
                                          'text-red-500'
                                      )}>
                                      {hasSignUpErrors(form.formState.errors) &&
                                      form.formState.errors.confirmPassword
                                        ? form.formState.errors.confirmPassword.message
                                        : hasConfirmPasswordText
                                          ? 'Confirm'
                                          : 'repeat password'}
                                    </InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    )}
                  </div>

                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? (
                      <LoadingIcon className="animate-spin" />
                    ) : modalType === 'signIn' ? (
                      'Continue'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-500 transition-all duration-300">
                    {modalType === 'signIn' ? 'Or sign in with' : 'Or sign up with'}
                  </span>
                </div>
              </div>

              <div className="flex w-full gap-0">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full rounded-r-none border-r-0"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={socialLoading}>
                  {socialLoading ? <LoadingIcon className="animate-spin" /> : <GoogleIcon />}
                  Google
                </Button>
                <Button variant="outline" className="flex-1 rounded-full rounded-l-none">
                  <PasskeyIcon />
                  Passkey
                </Button>
              </div>

              <p className="text-center text-xs text-neutral-600 transition-all duration-300">
                {modalType === 'signIn' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <span
                      onClick={() => setModalType('signUp')}
                      className="cursor-pointer font-medium text-neutral-900 transition-colors hover:underline">
                      Sign up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span
                      onClick={() => setModalType('signIn')}
                      className="cursor-pointer font-medium text-neutral-900 transition-colors hover:underline">
                      Sign in
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
