import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          {title && (
            <div className="p-4 sm:p-6 lg:p-8 pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
          
          <div className="p-4 sm:p-6 lg:p-8 pt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
