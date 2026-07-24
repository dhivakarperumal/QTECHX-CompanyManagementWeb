import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { getRoleHome } from "../../PrivateRouter/roleUtils";
import api from "../../api";
import Logo from '/images/logo.png';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Users, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "Email Address is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      const { data } = await api.post("/users/login", {
        identifier: formData.username,
        password: formData.password,
      });

      login(data.user, data.token);
      setSubmitted(true);
      navigate(getRoleHome(data.user?.role), { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#111317] flex font-sans overflow-hidden text-gray-300">
      {/* Left Panel */}
      <div 
        className="hidden lg:flex flex-col justify-between w-1/2 relative z-10 bg-[#0a0a0c] px-12 py-8"
        style={{
          borderBottomRightRadius: '25% 50%',
          borderTopRightRadius: '25% 50%',
          borderRight: '2px solid rgba(248, 116, 14, 0.4)',
          boxShadow: '10px 0 50px rgba(248, 116, 14, 0.15)'
        }}
      >
        {/* Top Logo */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
          <div className="leading-tight">
            <h1 className="text-lg font-bold text-white tracking-wide">COMPANY</h1>
            <h2 className="text-base font-bold text-white tracking-wide uppercase">MANAGEMENT</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">System</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col gap-4 max-w-md mt-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome <span className="text-primary">Back!</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sign in to continue managing your company operations efficiently.
            </p>
          </div>

          <div className="relative flex justify-center py-2">
             <div className="absolute bottom-4 w-48 h-8 bg-primary/30 blur-2xl rounded-[100%]"></div>
             <img src={Logo} alt="3D Logo" className="w-48 h-48 xl:w-56 xl:h-56 object-contain relative z-10 drop-shadow-2xl" />
          </div>
        </div>

        {/* Bottom Features */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl border border-primary/30 text-primary flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-0.5 text-sm">Secure & Protected</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Your data is safe with enterprise grade security</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl border border-primary/30 text-primary flex-shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-0.5 text-sm">Role Based Access</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Different roles, different permissions complete control</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl border border-primary/30 text-primary flex-shrink-0">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-0.5 text-sm">Smart Management</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Powerful tools to manage your entire organization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative overflow-y-auto">
        <div className="w-full max-w-[480px] min-h-[550px] bg-[#181a1f] p-8 md:p-12 rounded-[2rem] border border-gray-800 shadow-2xl relative z-20 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your credentials to access your account</p>
          <div className="w-10 h-1 bg-primary rounded-full mb-8"></div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                  <Mail size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  className={`w-full bg-[#101215] text-white text-base border ${errors.username ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full bg-[#101215] text-white text-base border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="appearance-none w-5 h-5 rounded border border-gray-600 bg-[#101215] checked:bg-primary checked:border-primary cursor-pointer transition-colors"
                  />
                  {formData.rememberMe && (
                    <svg className="w-3 h-3 text-white absolute pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-orange-400 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-base font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>

            {serverError && <p className="text-red-500 text-sm text-center mt-2">{serverError}</p>}
            {submitted && <p className="text-green-500 text-sm text-center mt-2">✅ Login successful!</p>}

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account? <a href="tel:+1234567890" className="text-primary hover:text-orange-400 transition-colors">Contact Administrator</a>
            </p>
            
            <div className="flex justify-center mt-2">
              <Link to="/" className="inline-flex items-center gap-1 text-sm transition-colors group">
                <ArrowLeft size={16} className="text-gray-500 group-hover:-translate-x-1 transition-transform group-hover:text-white" /> 
                <span className="text-gray-500 group-hover:text-white transition-colors">Back</span> 
                <span className="text-primary group-hover:text-orange-400 transition-colors">Home</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <div className="absolute bottom-4 right-4 lg:right-8 text-[10px] text-gray-600">
          &copy; 2025 Company Management System. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;


