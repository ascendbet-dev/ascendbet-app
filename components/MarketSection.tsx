"use client"

import { useState } from "react"

interface Props {
  title: string
  children: React.ReactNode
}

export function MarketSection({ title, children }: Props) {

  const [open,setOpen] = useState(true)

  return (
    <section className="mb-6">

      <button
        onClick={()=>setOpen(!open)}
        className="flex w-full items-center justify-between border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-muted"
      >
        {title}

        <span className="text-xs">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-3">
          {children}
        </div>
      )}

    </section>
  )
}