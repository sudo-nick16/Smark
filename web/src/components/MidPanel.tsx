import React from "react";
import { Route, Routes } from "react-router-dom";
import Account from "./Account";
import BookmarkList from "./BookmarkList";
import Protected from "./Protected";

type UrlListProps = {
    className?: string;
};

const MidPanel: React.FC<UrlListProps> = ({ className = "" }) => {
    return (
        <Routes>
            <Route
                path="/"
                id="app"
                element={<BookmarkList className={`section-b ${className}`} />}
            />
            <Route
                path="/my-account"
                id="account"
                element={
                    <Protected>
                        <Account className={`section-b ${className}`} />
                    </Protected>
                }
            />
            <Route
                path="/:userId/:listId"
                id="account"
                element={<BookmarkList className={`section-b ${className}`} />}
            />
        </Routes>
    );
};

export default MidPanel;
