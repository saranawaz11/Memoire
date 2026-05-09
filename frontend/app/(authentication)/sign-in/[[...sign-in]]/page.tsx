import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='h-dvh w-full flex flex-col justify-center items-center'>
            <SignIn signUpUrl='/sign-up' forceRedirectUrl='/notes' />
        </div>
    )
}