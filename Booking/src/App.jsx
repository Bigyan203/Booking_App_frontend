import { useContext } from 'react'
import './App.css'
import { useState } from 'react'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import { UserContext } from './components/UserContext'
import { useEffect } from 'react'

function App() {
  const{ user, setUser } = useContext(UserContext);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    else{
      setUser(null);
    }

    setloading(false);
  }, []);

  if(loading){
    return <div>Loading...</div>;
  }
  return (
    <>
      <Navbar> </Navbar>
      <Outlet> </Outlet>  
    </>
      
  );
}

export default App