import logoPoster from './assets/brand/logo-poster.png'
import { PAGE } from './content.js'

export default function App() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink p-6">
      <img
        src={logoPoster}
        alt={PAGE.logoAlt}
        width={1448}
        height={1086}
        className="h-auto w-[min(80vw,720px)] select-none"
        draggable={false}
      />
    </main>
  )
}
