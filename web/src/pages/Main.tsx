import { useAtom } from 'jotai';
import React from 'react'
import App from '../App';
import AuthModal from '../components/AuthModal';
import { isAuthAtom } from '../state';

type MainProps = {}

const Main: React.FC<MainProps> = () => {
    const [isAuth] = useAtom(isAuthAtom);
    return (
        <>
            <App />
            {
                !isAuth && <AuthModal />
            }
        </>
    )
}

export default Main;
