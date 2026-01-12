const currencyFormatters = new Map<string, Intl.NumberFormat>();

export const formatCurrency = (amount: number, currency: string) => {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(amount);
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export const formatDateTime = (value: string) => {
  return dateTimeFormatter.format(new Date(value));
};
