import React from 'react'
import bin from "../assets/bin.png";
import edit from "../assets/edit.png";
import share from "../assets/send.png";

type BarProps = {
    deleteHandler?: () => void;
    editHandler?: () => void;
    shareHandler?: () => void;
}

const Bar: React.FC<BarProps> = ({
    deleteHandler,
    editHandler,
    shareHandler,
}) => {
    return (
        <div className='bg-dark-gray flex items-center px-2 py-1 rounded-lg'>
            // <div onClick={deleteHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
            //     <img src={bin} alt="delete" className='h-4 w-4 mx-2' />
            // </div>
            // <div onClick={editHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
            //     <img src={edit} alt="edit" className='h-4 w-4 mx-2' />
            // </div>
            <div onClick={shareHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                <img src={share} alt="share" className='h-4 w-4 mx-2' />
            </div>
        </div>
    )
}

export default Bar;
