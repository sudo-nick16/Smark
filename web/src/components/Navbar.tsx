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

    for (let i = 0; i < 3; ++i) {
        lists.push(...lists);
    }

    const [navList, setNavList] = useState(lists);

    const handleClick = (ele: typeof lists[0]) => {
        setNavList(curr => curr.map(l => ({ ...l, selected: ele.name == l.name })))
    };

    return (
        <div className='h-screen ml-auto px-4 w-72 flex flex-col'>
            <div className='mt-4 ml-4'>
                <img src={smark} alt="smark" className='h-10 w-auto' />
            </div>
            <div className='mt-8 h-full max-h-full overflow-y-auto'>
                {
                    navList.map((ele, i) => (
                        <div onClick={() => handleClick(ele)} key={i} className={`py-2 px-4 ${ele.selected && "bg-dark-gray"} hover:bg-dark-gray hover:cursor-pointer rounded-lg font-semibold`}>
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
