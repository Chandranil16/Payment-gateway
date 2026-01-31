import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentForm from "./Components/Paymentform";
import PaymentStatus from "./Components/Paymentstatus";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentForm />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
      </Routes>
    </Router>
  );
};

export default App;