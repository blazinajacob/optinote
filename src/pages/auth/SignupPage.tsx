import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'technician'>('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, signInWithGoogle, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      // Handle password mismatch error
      return;
    }
    
    try {
      await signup(email, password, name, role);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Redirect happens automatically
    } catch (error) {
      // Error is handled by the auth store
    }
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding and imagery */}
      <div className="hidden lg:flex lg:w-1/2 bg-nature-gradient bg-cover bg-center text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center">
            <img src="/Optinote-Logo-Black.png" alt="Optinote" className="h-12 w-auto bg-white rounded-full p-1" />
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Join our growing community of eye care professionals</h2>
          <p className="text-lg text-white/90">
            Create your account today and experience the most comprehensive EHR system designed specifically for ophthalmology practices.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <p className="ml-3 text-white/90">Free 30-day trial, no credit card required</p>
            </div>
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <p className="ml-3 text-white/90">Secure and HIPAA-compliant platform</p>
            </div>
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <p className="ml-3 text-white/90">Dedicated support team for onboarding</p>
            </div>
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <p className="ml-3 text-white/90">No long-term commitments</p>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-white/60">
          © {new Date().getFullYear()} Optinote. All rights reserved.
        </div>
      </div>
      
      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/Optinote-Logo-Black.png" alt="Optinote" className="h-12 w-auto" />
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-primary-800">
              Create your account
            </h2>
            <p className="mt-2 text-gray-600">
              Get started with Optinote today
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Google Sign Up Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or sign up with email</span>
              </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  className="p-4 text-sm text-white bg-error-500 rounded-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-700 focus:border-primary-700 sm:text-sm transition-colors"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-700 focus:border-primary-700 sm:text-sm transition-colors"
                    placeholder="doctor@yourpractice.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-700 focus:border-primary-700 sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-700 focus:border-primary-700 sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  I am a
                </label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      role === 'doctor' 
                        ? 'border-primary-700 bg-primary-50 text-primary-800' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRole('doctor')}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        role === 'doctor' ? 'border-primary-700' : 'border-gray-400'
                      }`}>
                        {role === 'doctor' && (
                          <div className="w-2 h-2 rounded-full bg-primary-700"></div>
                        )}
                      </div>
                      <span className="ml-2 font-medium">Doctor</span>
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      role === 'technician' 
                        ? 'border-primary-700 bg-primary-50 text-primary-800' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRole('technician')}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        role === 'technician' ? 'border-primary-700' : 'border-gray-400'
                      }`}>
                        {role === 'technician' && (
                          <div className="w-2 h-2 rounded-full bg-primary-700"></div>
                        )}
                      </div>
                      <span className="ml-2 font-medium">Technician</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-700 focus:ring-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="text-primary-700 hover:text-primary-600">Terms of Service</a> and <a href="#" className="text-primary-700 hover:text-primary-600">Privacy Policy</a>
                </label>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                        <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create account'}
                </motion.button>
              </div>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-700 hover:text-primary-600">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;