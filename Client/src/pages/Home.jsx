import { Outlet } from 'react-router'
import Navbar from '../components/Navbar.jsx'

function Home() {

    return (
        <div>
            <Navbar />
            <Outlet />
        </div>
    )
}

export default Home