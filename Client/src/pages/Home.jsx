import { Outlet } from 'react-router'

function Home() {

    return (
        <div>
            {/* <Navbar /> */}
            <Outlet />
            <h1>Home</h1>
        </div>
    )
}

export default Home