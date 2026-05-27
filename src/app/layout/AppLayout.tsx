import { NavLink, Outlet } from "react-router-dom";

import { appConfig } from "../../shared/config/appConfig";

export function AppLayout() {
  return (
    <div className="sb-shell">
      <aside className="sb-sidebar">
        <strong>D2C Site Builder</strong>
        <nav>
          <NavLink to="/">首页</NavLink>
          <NavLink to="/publish">发布</NavLink>
        </nav>
      </aside>
      <div className="sb-main">
        <header className="sb-topbar">
          <span>{appConfig.appCode}</span>
          <span>Web {appConfig.webPort}</span>
          <span>API {appConfig.apiPort}</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
