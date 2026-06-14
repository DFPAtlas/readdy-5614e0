const stripeConfig = {
  plans: {
    'sentinel-starter': { monthlyPrice: 49, maxGuards: 10, maxSites: 1 },
    sentinel: { monthlyPrice: 99, yearlyPrice: 79, maxGuards: 25, maxSites: 3 },
    command: { monthlyPrice: 399, yearlyPrice: 319, maxGuards: 200, maxSites: 999 },
    titan: { contactOnly: true },
  },
  successUrl: '/checkout/success',
  cancelUrl: '/checkout/cancel',
};

export default stripeConfig;