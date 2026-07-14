import { Sidebar } from "@/components/portal/Sidebar";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <main className="min-h-screen md:ml-[250px]">{children}</main>
    </div>
  );
}
