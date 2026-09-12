# Route Inventory - GuardianHub

Generated: 2026-08-10

## Route Classification

### Public Routes
| Route | Type |
|---|---|
| / | Public landing |
| /about | Public |
| /platform | Public |
| /solutions | Public |
| /pricing | Public |
| /pricing/compare | Public |
| /contact | Public |
| /demo | Public |
| /terms | Public |
| /privacy | Public |
| /gdpr | Public |
| /cookies | Public |
| /blog | Public |
| /case-studies | Public |
| /docs | Public docs |
| /docs/[slug] | Dynamic - public |

### Authentication Routes
| Route | Type |
|---|---|
| /login | Auth |
| /login/client | Auth |
| /login/control-room | Auth |
| /login/guard | Auth |
| /signup | Auth |
| /ops/login | Auth |
| /ops/signup | Auth |
| /forgot-password | Auth |
| /reset-password | Auth |
| /recovery | Auth |
| /auth/callback | Auth callback |
| /setup-super-admin | Auth setup |

### Super Admin Routes
| Route | Type |
|---|---|
| /admin | Super admin dashboard |
| /admin/* | Super admin sub-pages |
| /super-admin/financial | Super admin financial |
| /super-admin/support | Super admin support |
| /super-admin/support/[id] | Dynamic - support ticket |
| /dashboard/super-admin | Super admin ops |

### Company Operations Routes
| Route | Type |
|---|---|
| /dashboard | Ops dashboard |
| /dashboard/* | All dashboard sub-pages |
| /dashboard/sites/[id] | Dynamic - site detail |
| /dashboard/sites/[id]/notices | Dynamic - site notices |
| /dashboard/clients/[clientId]/users | Dynamic - client users |
| /ops/* | Operations pages |
| /guards | Guards management |
| /sites | Sites management |
| /sites/[id] | Dynamic - site detail |
| /incidents | Incidents |
| /incidents/[id] | Dynamic - incident detail |
| /rotas | Rotas |
| /occurrence-book | Occurrence book |
| /reports | Reports |
| /sops | SOP management |
| /sop-builder | SOP builder |
| /sop-builder/[id] | Dynamic - SOP detail |
| /notifications | Notifications |
| /ops-room | Operations room |

### Guard Routes
| Route | Type |
|---|---|
| /guard | Guard home |
| /guard/* | Guard sub-pages |
| /guard/cover-offers/[offer_id] | Dynamic - cover offer |
| /guard/patrol/scan/[checkpoint_code] | Dynamic - patrol scan |
| /guard-dashboard | Guard dashboard |

### Client Routes
| Route | Type |
|---|---|
| /client | Client home |
| /client/* | Client sub-pages |
| /client/sites/[id] | Dynamic - site detail |
| /client/incidents/[id] | Dynamic - incident detail |
| /client/support/[id] | Dynamic - support ticket |
| /client/billing | Client billing |

### Checkout Routes
| Route | Type |
|---|---|
| /checkout/success | Stripe success |
| /checkout/cancel | Stripe cancel |

### Legacy/Demo Routes
| Route | Type |
|---|---|
| /ops/forms | Legacy forms |
| /ops/guards | Legacy guards |
| /ops/incidents | Legacy incidents |
| /ops/occurrence-book | Legacy OB |
| /ops/reports | Legacy reports |
| /ops/sites | Legacy sites |

### Dynamic Route Summary
All dynamic routes use generateStaticParams with mock IDs for static export compatibility.
Real production IDs will require removal of output: "export" or a compatible strategy.