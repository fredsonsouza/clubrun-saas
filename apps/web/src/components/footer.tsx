export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-gray-500 md:flex-row">
        <div>© 2026 Club Run. All rights reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="transition-colors hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Terms of Service
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
