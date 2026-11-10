
import {
  LayoutDashboard,
  ArrowLeftRight,
  LogOut,
  Wallet,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Wallet size={24} />
        </div>
        <h2>ExpenseFlow</h2>
      </div>

      <div className="sidebar-menu">
        <p className="menu-heading">MENU</p>

        <NavLink to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/transactions" className="sidebar-link">
          <ArrowLeftRight size={19} />
          <span>Transactions</span>
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-details">
            <h4>{user?.name || "User"}</h4>
            <p>Personal Account</p>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
