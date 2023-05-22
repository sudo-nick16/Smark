import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import App from '../App';
import store from '../store'

const Router = () => {
    return (
        <Provider store={store}>
            <HashRouter basename='/'>
                <App />
            </HashRouter>
        </Provider >
    )
}

export default Router;
