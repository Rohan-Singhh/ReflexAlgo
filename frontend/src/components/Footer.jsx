import { Sparkle, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const linkGroups = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'How it works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Docs', href: '#docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
    ],
  },
];

const socials = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: 'mailto:support@reflexalgo.com' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.07] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                <Sparkle className="w-3.5 h-3.5 text-white" fill="currentColor" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Reflex<span className="text-zinc-400">Algo</span>
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              AI code review for algorithms. Find the bottleneck, fix the complexity,
              and ship faster code.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid place-items-center w-9 h-9 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/[0.07] pt-8">
          <p className="text-sm text-zinc-500">
            © {currentYear} ReflexAlgo. All rights reserved.
          </p>
          <p className="text-sm text-zinc-600">Built for developers who care about complexity.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
