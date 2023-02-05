import React, { useRef, useState } from 'react'
import options from '../assets/option.png'
import ContextMenu from './ContextMenu';

type ProfileProps = {}

const Profile: React.FC<ProfileProps> = () => {
    const [show, setShow] = useState(false);
    const selfRef = useRef<HTMLElement>(null);

    const [xy, setXY] = useState({
        x: 0,
        y: 0,
    })

    const menuItems = [
        {
            name: "sync",
            handler: () => {
            }
        },
        {
            name: "Logout",
            handler: () => {
            }
        }
    ]
    return (
        <div
            ref={selfRef}
            onContextMenu={(e) => {
                e.preventDefault();
                setXY({ x: e.clientX, y: e.clientY });
                setShow((s) => !s);
            }}
            className='flex items-center w-full mt-auto hover:bg-dark-gray p-2 rounded-full'
        >
            <div className='w-fit mr-3'>
                <img className='h-10 w-10' src="https://sudonick.vercel.app/sudonick.svg" alt="profile" />
            </div>
            <div className=''>
                <h1 className='font-bold text-lg leading-tight'>
                    sudonick
                </h1>
                <h3 className='text-md-gray text-sm leading-tight'>
                    syncing
                </h3>
            </div>
            <div className='mr-2 ml-auto hover:cursor-pointer'>
                <img className='h-5 w-5' src={options} alt="options" />
            </div>
            {
                show && <ContextMenu xy={xy} setShow={setShow} menuItems={menuItems} />

            }
        </div>
    )
}

export default Profile;

