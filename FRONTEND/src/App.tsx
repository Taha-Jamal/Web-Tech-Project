import Dashboard from "./Dashboard";
import { LoginPage } from "./components/LoginPage";
import { Signup } from "./components/Signup-Page";


import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found");
  }
  console.log(token);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="Signup" element={<Signup />} />
          {<Route path="Dashboard" element={<Dashboard />} />}
          <Route path="/" element={<LoginPage />} />
          {/* <Route path="*" element={<NoPage />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
