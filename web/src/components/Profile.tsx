import React, { useRef } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, toggleAuthModal, useAppDispatch } from '../store';
import { getItem, setItem } from '../store/storageApi';
import useAxios from '../utils/useAxios';

type ProfileProps = {}

const Profile: React.FC<ProfileProps> = () => {
    console.log("Profile is being rendered.");
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const api = useAxios();

    const selfRef = useRef<HTMLDivElement>(null);
    const authState = useSelector<RootState, RootState['auth']>(state => state.auth)

    const toggleModal = () => {
        console.log("toggle");
        appDispatch(toggleAuthModal());
    }

    const goToAccount = () => {
        navigate("/my-account");
    }

    const syncBookmarks = async () => {
        const events = await getItem("smark_events");
        console.log({ events });
        const res = await api.post("/sync", {
            events,
        })
        console.log(res.data);
        if (!res.data.error) {
            console.log("synced");
            await setItem("smark_events", []);
            return
        }
        console.log("failed synced");
    }

    return (
        !authState.user ?
            <div
                className='flex items-center justify-center w-full mt-auto
                bg-dark-gray opacity-90 hover:opacity-100 cursor-pointer p-2
                rounded-full h-12 font-medium text-base'
                onClick={toggleModal}
            >
                Sign in
            </div>
            :
            <div
                ref={selfRef}
                className='flex items-center w-full mt-auto p-1 rounded-full
                h-16 overflow-hidden'
            >
                <div className='w-fit mr-3' onClick={goToAccount}>
                    <img className='h-10 w-10' src={authState.user.img} alt="profile" />
                </div>
                <div className='flex flex-col'>
                    <h1 className='font-bold text-sm leading-tight line-clamp-1'>
                        {authState.user.name}
                    </h1>
                    <div className='flex flex-row w-full justify-evenly text-sm mt-2'>
                        <div className='s-shadow cursor-pointer bg-dark-gray rounded-xl flex justify-center items-center px-2 mr-2'>
                            Logout
                        </div>
                        <div onClick={syncBookmarks} className='s-shadow cursor-pointer bg-dark-gray rounded-xl flex justify-center items-center px-2'>
                            Sync
                        </div>
                    </div>
                </div>
                {
                    // <div className='mr-2 ml-auto hover:cursor-pointer' onClick={goToAccount}>
                    //     <img className='h-5 w-5' src={options} alt="options" />
                    // </div>
                }
            </div>
    )
}

export default Profile;
