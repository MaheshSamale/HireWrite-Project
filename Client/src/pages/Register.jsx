import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { registerUser } from "../services/user";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!name || !email || !password || !mobile) {
      toast.warn("Please fill all fields");
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password, mobile);
    if (result.status === "success") {
      toast.success("Signup Successful");
      navigate("/login");
    } else {
      toast.error(result.error || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <>
    <Navbar/>
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="mb-4 text-center">
                  <h2 className="fw-bold text-dark mb-1">Create Account</h2>
                  <p className="text-muted">Register as a job seeker</p>
                </div>

                <div className="mb-3">
                  <label htmlFor="inputName" className="form-label fw-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3"
                    id="inputName"
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="inputEmail" className="form-label fw-semibold">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg rounded-3"
                    id="inputEmail"
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="inputPassword"
                    className="form-label fw-semibold"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="inputPassword"
                    className="form-control form-control-lg rounded-3"
                    placeholder="8–20 characters, letters & numbers"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div id="passwordHelpBlock" className="form-text">
                    Your password must be 8–20 characters and contain letters
                    and numbers.
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="inputMobile"
                    className="form-label fw-semibold"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-lg rounded-3"
                    id="inputMobile"
                    placeholder="Enter your mobile number"
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold py-3 mb-3"
                  onClick={signup}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Register"}
                </button>

                <div className="text-center">
                  <span className="me-1">Have an account?</span>
                  <Link
                    to="/login"
                    className="text-decoration-none fw-semibold text-primary"
                  >
                    Log In →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Register;
