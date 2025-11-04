import React, { useState } from "react";
import Login from "./components/Login";
import SalesForm from "./components/SalesForm";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [auth, setAuth] = useState(null);

  if (!auth) return <Login onLogin={(d) => setAuth(d)} />;
  if (auth.user.role === "sales") return <SalesForm token={auth.token} />;
  return <AdminPanel token={auth.token} />;
}
