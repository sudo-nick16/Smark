import React from "react";
import { Route, Routes } from "react-router-dom";
import Account from "./Account";
import BookmarkList from "./BookmarkList";
import ForeignList from "./ForeignList";
import Protected from "./Protected";
import Settings from "./Settings";

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
                path="/settings"
                id="settings"
                element={<Settings className={`section-b ${className}`} />}
            />
            <Route
                path="/:userId/:listId"
                id="account"
                element={<ForeignList className={`section-b ${className}`} />}
            />
        </Routes>
    );
};

export default MidPanel;
