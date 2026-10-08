import React from 'react';
import { OrderKanbanBoard } from './OrderKanbanBoard';

/**
 * AdminOrdersView - Vista principal de Gestión de Órdenes y Picking
 */
export function AdminOrdersView({
  orders = [],
  onAdvanceOrderStatus,
  onOpenDispatch,
  onSimulateOrder,
  onViewOrder,
  onReportIncident,
}) {
  return (
    <OrderKanbanBoard
      orders={orders}
      onAdvanceStatus={onAdvanceOrderStatus}
      onOpenDispatch={onOpenDispatch}
      onSimulateOrder={onSimulateOrder}
      onViewOrder={onViewOrder}
      onReportIncident={onReportIncident}
    />
  );
}
