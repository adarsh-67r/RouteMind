// Shared Framer Motion animation variants used across multiple pages.

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
  animate: { transition: { staggerChildren: 0.05 } },
}
