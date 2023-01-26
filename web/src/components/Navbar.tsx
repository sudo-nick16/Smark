import React, { useState } from 'react';
import smark from "../assets/smark.png";
import Profile from './Profile';

type NavbarProps = {}

const Navbar: React.FC<NavbarProps> = () => {
    const lists = [
        {
            name: "Home",
            selected: true,
        },
        {
            name: "Personal",
            selected: false,
        },
    ]
    const [navList, setNavList] = useState(lists);

    const handleClick = (ele: typeof lists[0]) => {
        setNavList( curr => curr.map(l => ({...l, selected: ele.name == l.name})))
    };

    return (
        <div className='ml-auto px-4 w-72 flex flex-col'>
            <div className='mt-4 ml-4'>
                <img src={smark} alt="smark" className='h-10 w-auto' />
            </div>
            <div className='mt-8'>
                {
                    navList.map((ele, i)  => (
                        <div onClick={() => handleClick(ele)} key={i} className={`py-2 px-4 ${ele.selected && "bg-dark-gray"} hover:bg-dark-gray hover:cursor-pointer rounded-lg font-semibold`}>
                            {ele.name}
                        </div>
                    ))
                }
            </div>
            <Profile />
        </div>
    )
}

export default Navbar
