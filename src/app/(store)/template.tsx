// Next vuelve a montar el template en cada navegación (el layout no), así que
// la clase .page-enter (globals.css) da un fundido corto al entrar a cada
// página de la tienda.
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
