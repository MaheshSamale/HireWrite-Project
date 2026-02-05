import React from "react";
import { Link, useNavigate } from "react-router";
import '../styles/Navbar.css';
function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        window.sessionStorage.removeItem("token");
        navigate("/");
    };

    const goJobSeeker = () => navigate("/login");          // Job seeker login page
    const goRecruiter = () => navigate("/company-login");  // Company login page

    return (
        <>
            {/* TOP BAR */}
            <div className="bg-white border-bottom small">
                <div className="container-fluid d-flex justify-content-end py-1">
                    <a href="#jobseekers" className="text-decoration-none text-dark me-3">
                        Job Seekers
                    </a>
                    <a href="#recruiter" className="text-decoration-none text-dark">
                        Recruiter
                    </a>
                </div>
            </div>

            {/* MAIN NAVBAR */}
            <nav className="navbar navbar-expand-lg bg-white border-bottom py-2">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/home">
                        HireWrite
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-end" id="mainNavbar">
                        <ul className="navbar-nav me-3">
                            <li className="nav-item">
                                <a className="nav-link" href="#jobs">
                                    Jobs
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#services">
                                    Services
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#blogs">
                                    Blogs
                                </a>
                            </li>
                        </ul>

                        {/* Search */}
                        <form className="d-none d-md-flex ms-3" role="search">
                            <div className="input-group" style={{ maxWidth: 380 }}>
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    className="form-control border-start-0"
                                    type="search"
                                    placeholder="Search Jobs"
                                    aria-label="Search jobs"
                                />
                            </div>
                        </form>

                        {/* Auth buttons */}
                        <div className="d-flex gap-2 ms-3">
                            {/* LOGIN DROPDOWN (as before) */}
                            <div className="dropdown dropdown-hover position-relative">
                                <button
                                    className="btn btn-outline-primary d-flex align-items-center rounded-pill px-4 dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="bi bi-box-arrow-in-right me-1"></i>
                                    Log In
                                </button>

                                <ul className="dropdown-menu login-dropdown-menu shadow border-0">
                                    <li className="mb-2 px-3 text-muted fw-semibold small">Log in As</li>

                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center gap-3 py-2 px-3"
                                            onClick={() => navigate("/login")}
                                        >
                                            <i className="bi bi-person fs-4"></i>
                                            <span className="fw-medium" >Job Seekers</span>
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center gap-3 py-2 px-3"
                                            onClick={() => navigate("/company-login")}
                                        >
                                            <i className="bi bi-briefcase fs-4"></i>
                                            <span className="fw-medium">Company</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* REGISTER DROPDOWN (new) */}
                            <div className="dropdown dropdown-hover position-relative">
                                <button
                                    className="btn btn-primary d-flex align-items-center rounded-pill px-4 dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="bi bi-person me-1"></i>
                                    Register
                                </button>

                                <ul className="dropdown-menu login-dropdown-menu shadow border-0">
                                    <li className="mb-2 px-3 text-muted fw-semibold small">Register As</li>

                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center gap-3 py-2 px-3"
                                            onClick={() => navigate("/register")}
                                        >
                                            <i className="bi bi-person-plus fs-4"></i>
                                            <span className="fw-medium">Job Seeker</span>
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center gap-3 py-2 px-3"
                                            onClick={() => navigate("/register-company")}
                                        >
                                            <i className="bi bi-briefcase-fill fs-4"></i>
                                            <span className="fw-medium">Company</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
