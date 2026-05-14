// app/admin/layout.tsx

import { Suspense } from "react";
import Header from "./components/Header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    
    <div>

      <Header />

      <main>
        {children}
      </main>
    <Suspense/>
    </div>
    
  );
}