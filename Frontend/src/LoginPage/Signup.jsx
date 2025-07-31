import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [gmail, setGmail] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    console.log({ username, password, role, gmail });
    navigate('/');
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>Sign Up</h2>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
        </label>
        <label>
          Gmail:
          <input type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} required />
        </label>
        <button type="submit">Sign Up</button>
        <p>
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/')} className="link-btn">
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Signup;
