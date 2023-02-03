import React from 'react'
import App from '../App';
import AuthModal from '../components/AuthModal';

type MainProps = {}

const Main: React.FC<MainProps> = () => {
    return (
        <>
            <App />
            <AuthModal />
        </>
    )
}

export default Main;
