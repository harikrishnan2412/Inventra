import { Routes, Route } from 'react-router-dom';
import Login from './LoginPage/Login';
import Signup from './LoginPage/Signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
