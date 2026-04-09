const logger = require('logger').createLogger({
  level: 'info',
  format: 'json'
});

const stripe = require('stripe')(process.env.STRIPE_KEY);

function processPayment(cardNumber, amount) {
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
    chargeCard(cardNumber, amount);
  } catch (error) {
    logger.error('Error processing payment', error);
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

function chargeCard(cardNumber, amount) {
  try {
    const charge = stripe.charges.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      source: cardNumber,
      description: 'Test charge'
    });
    logger.info(`Charge successful: ${charge.id}`);
  } catch (error) {
    logger.error('Error charging card', error);
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