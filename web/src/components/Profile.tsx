import React from 'react'
import options from '../assets/option.png'

type ProfileProps = {}

const Profile: React.FC<ProfileProps> = () => {
    return (
        <div className='flex items-center w-full mt-auto hover:bg-dark-gray p-2 rounded-full'>
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
        </div>
    )
}

export default Profile;

