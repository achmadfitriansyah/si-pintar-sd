/** Ikon buatan sendiri: file SVG terpisah di /public/ikon/<grup>/<nama>.svg */
export default function Icon({ name, size = 24, className = "", alt = "", ...rest }) {
  return <img src={`/ikon/${name}.svg`} width={size} height={size} alt={alt} draggable={false} className={`inline-block shrink-0 select-none ${className}`} {...rest} />;
}
