export default function Ribbon({ children, color = "red", className = "" }) {
  return (
    <div className={`inline-block ${className}`}>
      <div className={`ribbon ribbon-${color}`}>{children}</div>
    </div>
  );
}
