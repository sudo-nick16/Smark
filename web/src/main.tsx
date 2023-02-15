import ReactDOM from 'react-dom/client'
import { UrqlProvider } from './graphql/client'
import './index.css'
import Router from './pages/Router'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<UrqlProvider><Router /></UrqlProvider>)
