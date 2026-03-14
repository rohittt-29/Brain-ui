import { BASE_URL } from '@/utils/constant';
import { setUser } from '@/utils/UserSlice';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, BookOpen, Search, Lightbulb, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import iconImg from '@/assets/Icon.png';

const Login = () => {
  const [signup, setSignup] = useState(false);
  const [username, setusername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, seterror] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handlelogin = async () => {
    try {
      setLoading(true);
      seterror('');
      const res = await axios.post(BASE_URL + '/api/auth/login', { email, password }, { withCredentials: true });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(setUser(res.data.user));
      setLoading(false);
      return navigate('/');
    } catch (error) {
      seterror(error?.response?.data?.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      seterror('');
      const res = await axios.post(BASE_URL + '/api/auth/signup', { username, email, password }, { withCredentials: true });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(setUser(res.data.user));
      setLoading(false);
      return navigate('/');
    } catch (error) {
      seterror(error?.response?.data?.message || 'An error occurred');
      setLoading(false);
    }
  };

  const toggleSignup = () => {
    setSignup(!signup);
    seterror('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup ? handleSignup() : handlelogin();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/10 rounded-full blur-3xl animate-pulse-slow" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating icons */}
        <div className="absolute top-[15%] left-[10%] text-green-500/20 animate-float-icon-1">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="absolute top-[20%] right-[15%] text-emerald-500/20 animate-float-icon-2">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-[25%] left-[20%] text-green-400/15 animate-float-icon-3">
          <BookOpen className="w-9 h-9" />
        </div>
        <div className="absolute bottom-[15%] right-[10%] text-emerald-400/20 animate-float-icon-1">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div className="absolute top-[60%] left-[8%] text-green-500/15 animate-float-icon-2">
          <Lightbulb className="w-7 h-7" />
        </div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4 backdrop-blur-sm border border-green-500/20">
            <img src={iconImg} alt="Insight Box" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Insight Box</h1>
          <p className="text-slate-400 text-sm mt-1">Your second brain, organized.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-green-900/10">
          {/* Header */}
          <h2 className="text-2xl font-bold text-white text-center mb-1">
            {signup ? 'Welcome !' : 'Welcome back !'}
          </h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            {signup ? (
              <>Already a member?{' '}<button type="button" onClick={toggleSignup} className="text-green-400 hover:text-green-300 font-medium transition-colors">Login here</button></>
            ) : (
              <>Are you a newcomer?{' '}<button type="button" onClick={toggleSignup} className="text-green-400 hover:text-green-300 font-medium transition-colors">Sign up here</button></>
            )}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field — signup only */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                signup ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Name"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button */}
            {loading ? (
              <div className="space-y-3 pt-1">
                <div className="h-12 bg-slate-800/60 rounded-lg overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 animate-shimmer" />
                </div>
                <div className="h-5 w-3/5 mx-auto bg-slate-800/60 rounded overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 animate-shimmer" />
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-green-900/30 hover:shadow-green-900/50 transition-all duration-300 active:scale-[0.98] text-sm tracking-wide uppercase"
              >
                {signup ? 'Sign Up' : 'Login'}
              </button>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          By continuing, you agree to Insight's Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Login;
