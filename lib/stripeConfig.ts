const stripeConfig = {
  plans: {
    'sentinel-starter': { maxGuards: 10, maxSites: 1 },
    sentinel: { maxGuards: 25, maxSites: 3 },
    command: { maxGuards: 200, maxSites: 999 },
    titan: { contactOnly: true },
  },
  successUrl: '/checkout/success',
  cancelUrl: '/checkout/cancel',
};

export default stripeConfig;