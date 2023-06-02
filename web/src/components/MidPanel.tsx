import React from "react";
import { Route, Routes } from "react-router-dom";
import Account from "./Account";
import BookmarkList from "./BookmarkList";
import ForeignList from "./ForeignList";
import Protected from "./Protected";
import MoreOptions from "./MoreOptions";

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
                path="/more-options"
                id="settings"
                element={<MoreOptions className={`section-b ${className}`} />}
            />
            <Route
                path="/:userId/:listId"
                id="foreign-list"
                element={<ForeignList className={`section-b ${className}`} />}
            />
        </Routes>
    );
};

export default MidPanel;
