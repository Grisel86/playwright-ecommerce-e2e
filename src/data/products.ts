/**
 * Product catalog and checkout data used across tests.
 * Keeping this in one place means if SauceDemo changes a product name or
 * price, we update it once and every test keeps passing.
 */

export const products = {
  backpack: {
    name: 'Sauce Labs Backpack',
    price: 29.99,
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    price: 9.99,
  },
  boltTShirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
  },
  fleeceJacket: {
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
  },
  onesie: {
    name: 'Sauce Labs Onesie',
    price: 7.99,
  },
  redTShirt: {
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
  },
} as const;

export const validCustomer = {
  firstName: 'Fabiana',
  lastName: 'Gonzalez',
  postalCode: '5360',
};

// Tax rate used by SauceDemo in the checkout step-2 summary.
// Captured as a constant so tests can verify the math rather than hardcoding amounts.
export const SAUCE_TAX_RATE = 0.08;
