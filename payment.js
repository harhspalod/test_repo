function processPayment(cardNumber, amount) {
  // Logging sensitive data
  console.log("Processing card: " + cardNumber);
  
  // No validation
  if (amount) {
    charge(cardNumber, amount);
  }
  
  // Hardcoded API key
  const STRIPE_KEY = "sk_live_abcdef123456";
  
  // Race condition - no lock
  let balance = getBalance();
  balance = balance - amount;
  setBalance(balance);
}
// trigger auto-fix
// trigger auto-fix
