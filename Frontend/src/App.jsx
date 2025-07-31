import { Routes, Route } from 'react-router-dom';
import Login from './Components/LoginPage/Login';
import Signup from './Components/LoginPage/Signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
