import React from 'react';
import { ShoppingCart, Truck, Factory, Calendar } from 'lucide-react';

/**
 * AdminPurchasesView - Abastecimiento, Talleres de Confección y Proveedores
 */
export function AdminPurchasesView() {
  const purchaseOrders = [
    {
      id: "OC-2026-104",
      supplier: "Taller Textil Altamira",
      material: "Algodón Pesado 400 GSM (Noir)",
      units: 200,
      total: "$ 4,200.00",
      status: "En Confección",
      deliveryDate: "05/10/2026",
      statusBadge: "bg-slate-100 text-slate-800 border-slate-300",
    },
    {
      id: "OC-2026-103",
      supplier: "Cremalleras & Herrajes YKK",
      material: "Cremalleras Metálicas 2 vías",
      units: 500,
      total: "$ 1,150.00",
      status: "Recibido en Bodega",
      deliveryDate: "20/09/2026",
      statusBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "OC-2026-102",
      supplier: "Hilaturas del Norte",
      material: "Hilos Poliéster Alta Resistencia",
      units: 50,
      total: "$ 380.00",
      status: "Recibido en Bodega",
      deliveryDate: "15/09/2026",
      statusBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Cadena de Suministro
        </p>
        <h2 className="text-xl font-black text-slate-900">
          Abastecimiento & Confección
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3.5">Orden de Compra</th>
              <th className="px-4 py-3.5">Taller / Proveedor</th>
              <th className="px-4 py-3.5">Materia Prima / Insumo</th>
              <th className="px-4 py-3.5">Unidades</th>
              <th className="px-4 py-3.5">Monto Total</th>
              <th className="px-4 py-3.5">Estado</th>
              <th className="px-4 py-3.5 text-right">Fecha Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-mono font-black text-slate-900">{po.id}</td>
                <td className="px-4 py-3.5 font-bold text-slate-900">{po.supplier}</td>
                <td className="px-4 py-3.5 text-slate-600">{po.material}</td>
                <td className="px-4 py-3.5 font-bold text-slate-800">{po.units} un</td>
                <td className="px-4 py-3.5 font-black text-slate-900">{po.total}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black ${po.statusBadge}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-500">
                  {po.deliveryDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
