import { motion } from 'framer-motion';

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
};

export const Eyebrow = ({ children, className = '' }) => (
  <span className={`eyebrow inline-flex items-center gap-2 ${className}`}>
    <span className="h-1 w-1 rounded-full bg-violet-400" />
    {children}
  </span>
);

export const SectionHeading = ({ eyebrow, title, accent, subtitle, align = 'center' }) => (
  <motion.div
    {...fade}
    className={`max-w-2xl mb-14 ${align === 'center' ? 'mx-auto text-center' : ''}`}
  >
    {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
    <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-metal">
      {title}
      {accent && (
        <>
          {' '}
          <span className="text-gradient">{accent}</span>
        </>
      )}
    </h2>
    {subtitle && (
      <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-400">
        {subtitle}
      </p>
    )}
  </motion.div>
);

export const Section = ({ id, children, className = '', containerClassName = '' }) => (
  <section id={id} className={`relative py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className={`relative mx-auto max-w-7xl ${containerClassName}`}>{children}</div>
  </section>
);

export { fade };
