// app/admin/layout.tsx

import { Suspense } from "react";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    
    <div>
      <main>
        {children}
      </main>
    <Suspense/>
    </div>
    
  );
}