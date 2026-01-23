import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { UserContext } from "../App";
import { loginCandidate } from "../services/candidate";
import Navbar from "../components/Navbar";

function CandidateLogin() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signin = async () => {
    if (!email || !password) {
      toast.warn("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await loginCandidate(email, password);
      if (result.status === "success") {
        sessionStorage.setItem("token", result.data.token);
        sessionStorage.setItem("user",{ name : result.data.email})
        setUser({
          email: result.data.email,
          password: result.data.password,
        });
        toast.success("Login Successful");
        navigate("/home");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (ex) {
      console.error(ex);
      toast.error("Something went wrong");
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
                  <h2 className="fw-bold text-dark mb-1">Log in as Job Seekers</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg rounded-3"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg rounded-3"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold py-3 mb-3"
                  onClick={signin}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="text-center">
                  <span className="me-1">Don&apos;t have an account?</span>
                  <Link
                    to="/register"
                    className="text-decoration-none fw-semibold text-primary"
                  >
                    Create Account →
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

export default CandidateLogin;
