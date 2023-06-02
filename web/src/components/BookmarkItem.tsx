import bin from "../assets/bin.png";
import edit from "../assets/edit.png";
import urlImg from "../assets/url.png";
import { deleteBookmark } from "../store/asyncActions";
import { openBookmarkModal, useAppDispatch } from "../store/index";
import { Bookmark } from "../types";

type BookmarkItemProps = {
    bookmark: Bookmark;
    index: number;
};

const BookmarkItem: React.FC<BookmarkItemProps> = ({
    bookmark: { title, url, img, listTitle },
    index,
}) => {
    const appDispatch = useAppDispatch();

    const editHandler = () => {
        appDispatch(
            openBookmarkModal({
                title,
                listTitle,
                url,
            })
        );
    };

    const deleteHandler = () => {
        appDispatch(deleteBookmark({ title, listTitle }));
    };
     
    return (
        <div
            draggable
            className="flex flex-row items-center px-3 py-3 border-b border-b-dark-gray hover:bg-dark-gray w-full"
        >
            <div className="flex items-center justify-center w-6 min-w-[1.5rem] h-6 min-h-[1.5rem]">
                <img
                    src={img || urlImg}
                    alt="title"
                    className="w-full h-full"
                />
            </div>
            <div className="flex flex-col w-full overflow-x-clip pl-3">
                <p className="font-medium text-base break-words w-fit max-w-[95%] line-clamp-2">
                    {title}
                </p>
                <a
                    target={"_blank"}
                    href={url}
                    className="max-w-[90%] w-fit text-md-gray opacity-40 font-semibold text-sm underline truncate"
                >
                    {url}
                </a>
            </div>
            <div className="bg-dark-gray flex items-center py-1 rounded-lg px-1">
                <div
                    onClick={deleteHandler}
                    className="hover:bg-[#4E4E4E] flex items-center justify-center py-1 opacity-40 hover:opacity-100 rounded-md cursor-pointer"
                >
                    <img src={bin} alt="delete" className="h-4 w-4 mx-2" />
                </div>
                <div
                    onClick={editHandler}
                    className="hover:bg-[#4E4E4E] flex items-center justify-center py-1 opacity-40 hover:opacity-100 rounded-md cursor-pointer"
                >
                    <img src={edit} alt="edit" className="h-4 w-4 mx-2" />
                </div>
            </div>
        </div>
    );
};

export default BookmarkItem;
