import { createRoot } from "react-dom/client"
import AdminApp from "./components/AdminApp"
import "./styles/admin.scss"

// Initialize React app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("upspr-admin-root")
  if (container) {
    const root = createRoot(container)
    root.render(<AdminApp />)
  }
})
