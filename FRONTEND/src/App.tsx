import Dashboard from "./Dashboard";
import { LoginPage } from "./components/LoginPage";
import { Signup } from "./components/Signup-Page";

import { DatePickerDemo } from "./components/datepicker";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="Signup" element={<Signup />} />
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="datepicker" element={<DatePickerDemo />}>
            {/* <Route path="*" element={<NoPage />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
