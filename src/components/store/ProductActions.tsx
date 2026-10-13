'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { flyToCart } from '@/lib/fly-to-cart'
import type { ProductShade } from '@/types/product'

interface ProductActionsProps {
  productId: string
  productName: string
  price: number
  imageUrl: string | null
  selectedShade: ProductShade | null
}

export function ProductActions({
  productId,
  productName,
  price,
  imageUrl,
  selectedShade,
}: ProductActionsProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const addItem = useCartStore((s) => s.addItem)

  const outOfStock = !selectedShade || selectedShade.stock === 0
  const maxQty = selectedShade && selectedShade.stock > 0 ? selectedShade.stock : 1

  // Render-body setState: clamp qty when selected shade changes (avoids useEffect)
  const [prevShadeId, setPrevShadeId] = useState(selectedShade?.id ?? null)
  if (prevShadeId !== (selectedShade?.id ?? null)) {
    setPrevShadeId(selectedShade?.id ?? null)
    if (selectedShade && qty > selectedShade.stock && selectedShade.stock > 0) {
      setQty(selectedShade.stock)
    } else if (!selectedShade || selectedShade.stock === 0) {
      setQty(1)
    }
  }

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    if (!selectedShade || outOfStock) return

    flyToCart(e.currentTarget.getBoundingClientRect(), selectedShade.hex_color)

    addItem({
      productId,
      shadeId: selectedShade.id,
      productName,
      shadeName: selectedShade.name,
      shadeHex: selectedShade.hex_color,
      imageUrl,
      unitPrice: price,
      quantity: qty,
      stock: selectedShade.stock,
    })

    setAdded(true)
    setShowCart(true)
    setToastMsg(`${productName} · ${selectedShade.name}`)

    setTimeout(() => {
      setAdded(false)
      setToastMsg(null)
    }, 1500)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Quantity selector */}
        {!outOfStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-body text-fg-2">Cantidad</span>
            <div className="flex items-center border border-rim rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Reducir cantidad"
                className="w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg hover:bg-alt transition-colors disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-body font-medium text-fg select-none">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                aria-label="Aumentar cantidad"
                className="w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg hover:bg-alt transition-colors disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Add to cart — normal flow en desktop */}
        <motion.button
          onClick={handleAdd}
          disabled={outOfStock}
          whileTap={outOfStock ? undefined : { scale: 0.98 }}
          className={`hidden md:flex w-full items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-body font-medium transition-colors duration-200 ${
            outOfStock
              ? 'bg-alt text-fg-3 cursor-not-allowed'
              : added
              ? 'bg-success text-white'
              : 'bg-noir text-beige hover:opacity-90'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                ¡Añadido!
              </motion.span>
            ) : outOfStock ? (
              <motion.span key="out">Sin stock</motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <ShoppingBag size={16} />
                Añadir al carrito
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Ver carrito — appears after first add */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Link
                href="/carrito"
                className="block w-full text-center py-3 rounded-xl border border-rim text-accent text-sm font-body font-medium hover:bg-highlight transition-colors duration-150"
              >
                Ver carrito
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/10"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <motion.button
          onClick={handleAdd}
          disabled={outOfStock}
          whileTap={outOfStock ? undefined : { scale: 0.99 }}
          className={`w-full flex items-center justify-center gap-2 font-body text-sm font-medium transition-colors duration-200 ${
            outOfStock
              ? 'opacity-40 cursor-not-allowed text-nude'
              : added
              ? 'text-success'
              : 'text-nude'
          }`}
          style={{ height: '56px' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added-m"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                ¡Añadido!
              </motion.span>
            ) : outOfStock ? (
              <motion.span key="out-m">Sin stock</motion.span>
            ) : (
              <motion.span
                key="idle-m"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <ShoppingBag size={16} />
                Añadir al carrito
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-fg text-card text-sm font-body shadow-lg whitespace-nowrap">
              <ShoppingBag size={14} className="shrink-0" />
              {toastMsg} añadido
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
