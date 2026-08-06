// A small stylised dried-flower sprig, drawn as inline SVG so the
// scattered decoration on the auth pages never depends on an external
// image loading correctly. Color comes from CSS `color` (currentColor),
// size/position/rotation from the wrapping element's className/style.
export default function DriedSprig({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 160"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M50 158 C 47 120, 45 85, 50 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <ellipse cx="36" cy="54" rx="10" ry="17" transform="rotate(-38 36 54)" fill="currentColor" opacity="0.75" />
      <ellipse cx="64" cy="68" rx="10" ry="17" transform="rotate(38 64 68)" fill="currentColor" opacity="0.75" />
      <ellipse cx="33" cy="88" rx="9" ry="15" transform="rotate(-42 33 88)" fill="currentColor" opacity="0.68" />
      <ellipse cx="67" cy="102" rx="9" ry="15" transform="rotate(42 67 102)" fill="currentColor" opacity="0.68" />
      <ellipse cx="40" cy="120" rx="8" ry="13" transform="rotate(-32 40 120)" fill="currentColor" opacity="0.6" />
      <ellipse cx="60" cy="130" rx="8" ry="13" transform="rotate(32 60 130)" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="40" r="4" fill="currentColor" opacity="0.85" />
    </svg>
  );
}