import { useAtom } from 'jotai'
import React from 'react'
import google from '../assets/google.png'
import close from '../assets/close.png'
import { showAuthModalAtom } from '../state'

type AuthModalProps = {}

const AuthModal: React.FC<AuthModalProps> = () => {
    const [show, setShow] = useAtom(showAuthModalAtom);
    return (
        <>
            {show &&
                <div className='fixed z-10 backdrop-blur-sm h-screen w-full flex items-center justify-center'>
                    <div className='bg-black px-14 py-8 rounded-xl s-shadow flex flex-col items-center justify-center relative'>
                        <img src={close} alt="close" className='h-4 w-4 absolute top-3 left-3 cursor-pointer' onClick={() => setShow(!show)} />
                        <h1 className='font-bold text-white text-3xl'>Sign in to Smark</h1>
                        <div className='bg-white rounded-full flex items-center py-2 px-4 mt-8 cursor-pointer'>
                            <img src={google} alt="google" className='h-6 w-6' />
                            <span className='ml-3 font-bold'>Continue with google</span>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default AuthModal;
