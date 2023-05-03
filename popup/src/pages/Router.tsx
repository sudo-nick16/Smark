import { createHashRouter, RouterProvider } from 'react-router-dom';
import Main from './Main';

const Router = () => {
    const router = createHashRouter([
        {
            path: "",
            element: <Main />
        },
        {
            path: "/",
            element: <Main />
        },
        {
            path: "/login",
            element: <Main />
            // element: <Login />
        },
    ])

    return (
        <RouterProvider router={router} />
    )
}

export default Router;
