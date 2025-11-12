import Link from "next/link"

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Shop", href: "/shop" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Register", href: "/register" },
      { label: "Login", href: "/login" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Missing pets", href: "/missing-pets" },
      { label: "Support", href: "/profile" },
      { label: "Community", href: "/pets" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="text-gray-300 mt-20" style={{ backgroundColor: '#f9f9fa' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#ffb067' }}>
                <span style={{ color: '#665a58' }}>🐾</span>
              </span>
              PetReunite
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Helping lost pets find their way home with smart tags and a caring community.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-gray-300 pt-6 text-sm text-gray-600 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PetReunite. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

