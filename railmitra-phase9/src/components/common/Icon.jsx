// A small, dependency-free icon set. Keeping icons as inline SVG paths
// avoids pulling in an icon library for Phase 1 while staying crisp at any size.
const PATHS = {
  train:
    "M12 2c-4.4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 20.5V21h2.2l1.5-1.5h4.6L15.8 21H18v-.5L16.5 19A3.5 3.5 0 0 0 20 15.5V6c0-3.5-3.6-4-8-4Zm-5.5 9V7h5v4h-5Zm7 0V7h5v4h-5ZM8.5 15.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm7 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z",
  search: "M10.5 3a7.5 7.5 0 1 0 4.66 13.4l4.72 4.72 1.42-1.42-4.72-4.72A7.5 7.5 0 0 0 10.5 3Zm-5.5 7.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z",
  ticket:
    "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 6v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-6V6Zm7 0v2h2V6h-2Zm0 4.5v2h2v-2h-2Zm0 4.5v2h2v-2h-2Z",
  user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.24-8 5v2h16v-2c0-2.76-3.6-5-8-5Z",
  menu: "M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z",
  close: "M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z",
  seat: "M6 4h2v9h8V4h2v9a2 2 0 0 1-2 2h-1v5h-2v-5H9v5H7v-5H6a2 2 0 0 1-2-2V4h2Z",
  group:
    "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 14c-2.7 0-6 1.3-6 4v2h9v-2c0-1.1.3-2.1 1-3-1-.6-2.4-1-4-1Zm8 0c-.6 0-1.3.06-2 .2.9.9 1.5 2.1 1.5 3.8v2h6.5v-2c0-2.7-3.3-4-6-4Z",
  priority: "M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4Zm-1.2 13.4L7 11.6l1.4-1.4 2.4 2.4 5-5L17.2 9l-6.4 6.4Z",
  shield: "M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4Zm0 2.2 7 3.1v4.7c0 3.9-2.9 6.9-7 7.9-4.1-1-7-4-7-7.9V7.3l7-3.1Z",
  signal:
    "M12 3a1.5 1.5 0 0 1 1.5 1.5v.6A7.5 7.5 0 0 1 19.9 12H21v2h-1.1a7.5 7.5 0 0 1-6.4 6.9v.6a1.5 1.5 0 0 1-3 0v-.6A7.5 7.5 0 0 1 4.1 14H3v-2h1.1A7.5 7.5 0 0 1 10.5 5.1v-.6A1.5 1.5 0 0 1 12 3Zm0 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Z",
  swap: "M7 4 3 8l4 4V9h9V7H7V4Zm10 8-4 4v-3H4v-2h9v-3l4 4Z",
  calendar:
    "M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8v10H5V10h14ZM5 8V6h14v2H5Z",
  arrowRight: "m13 5 7 7-7 7-1.4-1.4L16.2 13H4v-2h12.2L11.6 6.4 13 5Z",
  check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z",
};

export default function Icon({ name, size = 20, className = "", ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
