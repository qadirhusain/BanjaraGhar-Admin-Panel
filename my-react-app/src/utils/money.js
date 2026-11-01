const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

// The backend stores every amount in paise
export const formatPaise = (paise) => formatter.format((paise ?? 0) / 100)

export const paiseToRupees = (paise) => (paise ?? 0) / 100

export const rupeesToPaise = (rupees) => Math.round(Number(rupees) * 100)