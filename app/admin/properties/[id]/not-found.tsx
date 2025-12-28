export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-xl font-semibold">Property not found</h2>
      <p className="text-muted-foreground mt-2">
        The requested property does not exist or was removed.
      </p>
    </div>
  );
}
