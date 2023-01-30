import { useAtom } from 'jotai';
import React, { useState } from 'react';
import smark from "../assets/smark.png";
import { currentListAtom } from '../state';
import Profile from './Profile';

type NavbarProps = {}

const Navbar: React.FC<NavbarProps> = () => {
    const lists = [
        {
            name: "Home",
            hash: "home_234567",
            selected: true,
            favorites: true,
        },
        {
            name: "Personal",
            hash: "personal_234567",
            selected: false,
            favorites: true,
        },
        {
            name: "Articles",
            hash: "home_234567",
            selected: true,
            favorites: true,
        },
        {
            name: "Game",
            hash: "personal_234567",
            selected: false,
            favorites: true,
        },
        {
            name: "Ubuntu",
            hash: "personal_234567",
            selected: false,
            favorites: true,
        },
    ]

    const [navList, setNavList] = useState(lists);
    const [currentList, setCurrentList] = useAtom(currentListAtom);

    const handleClick = (ele: typeof lists[0]) => {
        setCurrentList(ele.name);
        setNavList(curr => curr.map(l => ({ ...l, selected: ele.name == l.name })))
    };

    return (
        <div className='h-screen px-4 w-auto max-w-xs flex flex-col'>
            <div className='mt-4 ml-4'>
                <img src={smark} alt="smark" className='h-10 w-auto' />
            </div>
            <div className='mt-8 w-full h-full max-h-full overflow-y-auto flex flex-col'>
                {
                    navList.map((ele, i) => (
                        <div
                            onClick={() => handleClick(ele)} key={i}
                            className={`py-2 px-4 ${ele.name == currentList && "bg-dark-gray"} w-full max-w-full hover:bg-dark-gray hover:cursor-pointer rounded-lg font-semibold`}
                        >
                            {ele.name}
                        </div>
                    ))
                }
            </div>
            <div className='my-4'>
                <Profile />
            </div>
        </div>
    )
}

export default Navbar
