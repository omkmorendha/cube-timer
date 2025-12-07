export default function NotFound() {
  return (
    <div className="min-h-screen bg-cube-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-brutal text-6xl text-cube-yellow mb-4">404</h1>
        <p className="font-mono text-cube-cement">Page not found</p>
        <a href="/" className="mt-4 inline-block font-brutal text-sm tracking-wider text-cube-white hover:text-cube-yellow transition-colors">
          BACK TO TIMER
        </a>
      </div>
    </div>
  );
}
