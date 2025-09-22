import { BASE_URL } from '@/utils/constant';
import { setUser } from '@/utils/UserSlice';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';



const Login = () => {
    const [signup, setSignup] = useState(false);
    const [username, setusername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error , seterror] = useState("")
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    // Redirect if already logged in
    useEffect(() => {
        if (user && localStorage.getItem('token')) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);
    
    const handlelogin = async() =>{
try {
    const res = await axios.post(BASE_URL + "/api/auth/login", {email, password},
         {withCredentials: true});
         console.log("Login response:", res.data);
         localStorage.setItem("token", res.data.token);
         localStorage.setItem("user", JSON.stringify(res.data.user));
         dispatch(setUser(res.data.user));
         return navigate('/')
} catch (error) {
  seterror(error?.response?.data?.message || "An error occurred")
    
}
    }
    const handleSignup = async ()=>{
        try {
            const res = await axios.post(BASE_URL + "/api/auth/signup",{
                username, email , password}, {withCredentials: true
            })
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            dispatch(setUser(res.data.user));
            return navigate('/')
        } catch (error) {
            seterror(error?.response?.data?.message || "An error occurred")
        }
    }
    const toggleSignup = () => {
        setSignup(!signup);
    }
  return (
    <div className='flex justify-center items-center h-screen'>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        {signup && (
            <>
  <label className="label">Name</label>
  <input type="email" className="input" placeholder="Name" 
  onChange={(e)=> setusername(e.target.value)}/>
  </>
        )}
 







  {/* <legend className="text-center text-2xl font-bold">Login</legend> */}

  <label className="label">Email</label>
  <input type="text" className="input" placeholder="Email" 
  onChange={(e)=> setEmail(e.target.value)}
  />
       {error && <p className='text-red-500'>{error}</p>}
  <label className="label">Password</label>
  <input type="password" className="input" placeholder="Password" 
  onChange={(e)=>setPassword(e.target.value)}
  />

  <button className="btn btn-neutral mt-4" onClick={signup? handleSignup : handlelogin}>{signup ? "Sign up" : "Login"}</button>

  <h2 className='text-center text-sm cursor-pointer' onClick={toggleSignup}>{signup ? "Already have an account? Login here" : "new user? Sign up here"}</h2>
</fieldset>
    </div>
  )
}

export default Login
