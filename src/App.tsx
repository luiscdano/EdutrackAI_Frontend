import DesignSystem from "./pages/design-system/DesignSystem";
import Login from "./pages/login/Login";

function App() {
  const currentPath =
    window.location.pathname.toLowerCase();

  if (currentPath === "/design-system") {
    return <DesignSystem />;
  }

  return <Login />;
}

export default App;