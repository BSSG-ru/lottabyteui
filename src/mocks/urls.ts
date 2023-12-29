export const urls: Urls = {
  0: {
    '': 'Main',
  },
  1: {
    domains: 'Domains',
    systems: 'Systems',
    tasks: 'Tasks',
    'logic-objects': 'Logic objects',
    queries: 'Queries',
    samples: 'Samples',
    data_assets: 'Assets',
    assets: 'Assets',
    indicators: 'Indicators',
    'business-entities': 'Business entities',
    products: 'Products',
    dq_rule: 'dq_rule',
    'quality-tasks': 'quality-tasks',
    settings: 'Settings',
    draft: 'Drafts'
  },
  2: {
    users: 'Users',
    connections: 'Connections',
    roles: 'Roles',
    stewards: 'Stewards',
    groups: 'Groups',
    workflows: 'Workflows'
  },
};

type Urls = {
  [key: number]: {
    [key: string]: string;
  };
};
