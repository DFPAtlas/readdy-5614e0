const stripeConfig = {
  prices: {
    sentinel_monthly: '',
    sentinel_yearly: '',
    command_monthly: '',
    command_yearly: '',
  },
  successUrl: '/checkout/success',
  cancelUrl: '/checkout/cancel',
};

export default stripeConfig;