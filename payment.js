const logger = require('logger').createLogger({
  level: 'info',
  format: 'json'
});

const stripe = require('stripe')(process.env.STRIPE_KEY);

function processPayment(customerId, amount) {
  if (!validateAmount(amount)) {
    logger.error('Invalid amount');
    return;
  }

  try {
    const balanceLock = acquireLock('balance');
    const currentBalance = getBalance();
    if (!validateBalance(currentBalance, amount)) {
      logger.error('Insufficient funds');
      return;
    }
    const newBalance = currentBalance - amount;
    setBalance(newBalance);
    const paymentMethod = getPaymentMethod(customerId);
    chargeCard(paymentMethod, amount);
  } catch (error) {
    logger.error('Error processing payment');
  } finally {
    releaseLock('balance');
  }
}

function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0;
}

function validateBalance(currentBalance, amount) {
  return currentBalance >= amount;
}

function validateCardNumber(cardNumber) {
  const cardRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13})$/;
  return cardRegex.test(cardNumber);
}

function chargeCard(paymentMethod, amount) {
  try {
    const charge = stripe.charges.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethod,
      description: 'Test charge',
      confirm: true
    });
    logger.info(`Charge successful: ${charge.id}`);
  } catch (error) {
    logger.error('Error charging card');
  }
}

function getBalance() {
  // implement get balance logic
}

function setBalance(balance) {
  // implement set balance logic
}

function acquireLock(resource) {
  // implement lock acquisition logic
}

function releaseLock(resource) {
  // implement lock release logic
}

function getPaymentMethod(customerId) {
  // implement get payment method logic using Stripe's payment method API
  // For example:
  return stripe.customers.retrieve(customerId).then(customer => {
    return customer.invoices.data[0].payment_intent.id;
  });
}