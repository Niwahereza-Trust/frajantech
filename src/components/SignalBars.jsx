export default function SignalBars({ variant = '', pulse = false }) {
  const classes = ['bars', variant, pulse ? 'pulse' : ''].filter(Boolean).join(' ')
  return (
    <span className={classes} aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
  )
}
