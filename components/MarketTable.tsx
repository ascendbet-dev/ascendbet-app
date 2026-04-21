"use client"

interface Props{
  columns:string[]
  rows:{
    label:string
    odds:number[]
  }[]
}

export function MarketTable({columns,rows}:Props){

  return(

    <div className="overflow-hidden rounded-lg border border-border">

      <table className="w-full text-xs">

        <thead className="bg-surface text-muted">

          <tr>

            <th className="px-2 py-2 text-left"></th>

            {columns.map(c=>(
              <th key={c} className="px-2 py-2 text-center">
                {c}
              </th>
            ))}

          </tr>

        </thead>

        <tbody>

          {rows.map(r=>(
            <tr key={r.label} className="border-t border-border">

              <td className="px-2 py-2 text-muted">
                {r.label}
              </td>

              {r.odds.map((o,i)=>(
                <td key={i} className="px-2 py-2 text-center font-semibold text-text">
                  {o.toFixed(2)}
                </td>
              ))}

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )
}