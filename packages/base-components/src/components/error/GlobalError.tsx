export function GlobalError() {
  return (
    <div className="flex items-center justify-center p-5 flex-col gap-2">
      <div className="text-4xl">Oops!
        Something went wrong.</div>
      <p>An unexpected error has occurred. Please contact the system administrator.</p>
    </div>
  );
}
