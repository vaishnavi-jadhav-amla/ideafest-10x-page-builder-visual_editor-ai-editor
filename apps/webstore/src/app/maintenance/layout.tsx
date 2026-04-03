import "@znode/base-components/tailwind-config/global.css";
import MaintenanceReloader from "./MaintenanceReloader";

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <MaintenanceReloader />
      <body className="flex flex-col min-h-screen">
        <div className="flex-1 pl-4 pr-4" aria-label="Page editor section">
          {children}
        </div>
      </body>
    </html>
  );
}