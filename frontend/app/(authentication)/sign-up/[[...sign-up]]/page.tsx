import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='h-dvh w-full flex flex-col justify-center items-center'>
            <SignUp signInUrl='/sign-in' forceRedirectUrl='/' fallbackRedirectUrl={'/'} />
        </div>
    )
}