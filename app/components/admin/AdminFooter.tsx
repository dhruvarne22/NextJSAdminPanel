export default function AdminFooter() {
  return (
    <footer className="h-10 border-t bg-background flex items-center justify-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Vardaan Estate Admin
    </footer>
  );
}
