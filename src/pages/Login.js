import React, { useEffect } from 'react'
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Heading from '../UI/Heading';
import Input from '../UI/Input';
import Button from '../UI/Button';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../assets/images/Index';
import { useApp } from '../Context/Context';
import Loader from '../components/Loader/Loader';
import bcrypt from "bcryptjs";

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().nonempty('Password is required').min(8, 'Password must be at least 8 characters long'),
});

function Login() {
  const apiUrl = process.env.REACT_APP_API_URL;
  // console.log('API URL:', apiUrl);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    sessionStorage.clear();
  }, []);


  const navigate = useNavigate();
  const { authError, setAuthError, loading, setLoading } = useApp('');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/users`);
      const user = response.data.find(user => user.username === data.username);
      
      if (user) {
        const isMatch = await bcrypt.compare(data.password, user.password);
        console.log(user.password)
        console.log(data.password)
        if(isMatch) {
          console.log('Login successful');
          const { id, firstName, lastName, email } = user;
          sessionStorage.setItem('userData', JSON.stringify({ id, firstName, lastName, email }));
          setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
            setAuthError('');
          }, 1500);
        } else {
          setAuthError('Invalid username or password');
          setLoading(false);
        }
      } else {
        setAuthError('Invalid username or password');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setAuthError('An error occurred while logging in');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:block relative w-1/2 bg-cover h-screen bg-center" style={{ backgroundImage: `url(${Logo.Background})`, 
     }}>
        <div className="absolute inset-0  opacity-50"></div>
      </div>
      <div className="p-6 sm:p-12 w-full lg:w-1/2">
        <div className="w-full lg:max-w-md p-6">
          <Heading level={2}>Welcome to ABC</Heading>
          <p className="text-gray-600">Where Financial Wisdom Meets Technology</p>
          <Heading level={3} className="mt-24">Log in with your credentials</Heading>
          {loading ? <Loader /> : ( 
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <Input label="Username" type="text" name="username" register={register} errors={errors} />
            <Input label="Password" type="password" name="password" register={register} errors={errors} />
            <Button type="submit">Log in</Button>
            {authError && <p className="text-red-600">{authError}</p>}
            <Link to={"/"} className="block text-orange-500 hover:underline">Forgot Password?</Link>

            <p className="text-sm text-gray-600 mt-2">
              Don't have an account?
              <Link to={"/signup"} className="text-indigo-600 hover:underline font-semibold">
                {" "} Register
              </Link>
            </p>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login
