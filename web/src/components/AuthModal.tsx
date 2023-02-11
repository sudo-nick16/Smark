import { useAtom } from 'jotai'
import React from 'react'
import google from '../assets/google.png'
import close from '../assets/close.png'
import { accessTokenAtom, isAuthAtom, showAuthModalAtom } from '../state'
import { SERVER_URL } from '../constants'
import axios from 'axios'

type AuthModalProps = {}

const AuthModal: React.FC<AuthModalProps> = () => {
    const [show, setShow] = useAtom(showAuthModalAtom);
    const [isAuth, setIsAuth] = useAtom(isAuthAtom);
    const [, setAccessToken] = useAtom(accessTokenAtom);
    const handleSignin = async () => {
        console.log(chrome.storage, typeof chrome.storage)
        if (typeof chrome.storage === "undefined") {
            console.log("this is web");
            window.location.assign(`${SERVER_URL}/oauth/google`);
        } else {
            chrome.identity.getAuthToken({ interactive: true }, async function(token) {
                console.log(token);
                const req = await axios.get(`${SERVER_URL}/oauth/chrome?token=${token}`, {
                    withCredentials: true,
                });
                console.log(req.data);
                if (req.data.err) {
                    setIsAuth(false);
                    return;
                }
                setAccessToken(req.data.accessToken);
                setIsAuth(true);
            });
        }
    }
    return (
        <>
            {show &&
                <div className='fixed z-10 backdrop-blur-sm h-screen w-full flex items-center justify-center'>
                    <div className='bg-black px-14 py-8 rounded-xl s-shadow flex flex-col items-center justify-center relative'>
                        <img src={close} alt="close" className='h-4 w-4 absolute top-3 left-3 cursor-pointer' onClick={() => setShow(!show)} />
                        <h1 className='font-bold text-white text-3xl'>Sign in to Smark</h1>
                        {/* <a href={`${SERVER_URL}/oauth/google`}> */}
                        <div onClick={handleSignin} className='bg-white rounded-full flex items-center py-2 px-4 mt-8 cursor-pointer'>
                            <img src={google} alt="google" className='h-6 w-6' />
                            <span className='ml-3 font-bold'>Continue with google</span>
                        </div>
                        {/* </a> */}
                    </div>
                </div>
            }
        </>
    )
}

export default AuthModal;
