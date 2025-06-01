export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="api-docs-layout min-h-screen bg-white dark:bg-slate-900">
      {children}
    </div>
  );
}
