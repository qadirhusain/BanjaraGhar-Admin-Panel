export const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: 'Pending payment',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
}

export const ORDER_STATUS_TONES = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  EXPIRED: 'neutral',
}

export const REFUND_LABELS = {
  INITIATED: 'Refund started',
  PROCESSED: 'Refunded',
  FAILED: 'Refund failed',
}

export const REFUND_TONES = {
  INITIATED: 'warning',
  PROCESSED: 'success',
  FAILED: 'danger',
}

export const RETURN_STATUS_LABELS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const RETURN_STATUS_TONES = {
  REQUESTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

export const SHIPMENT_STATUS_TONES = {
  PENDING: 'warning',
  BOOKED: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
}