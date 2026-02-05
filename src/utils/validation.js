const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isEmail = (value) => /.+@.+\..+/.test(value);

const asNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return null;
};

const pinRegex = /^\d{4}$/;

const registerSchema = (body) => {
  if (!body || typeof body !== 'object') {
    return { errors: { body: 'Invalid payload' } };
  }
  const { name, email, password } = body;
  const errors = {};
  if (!isNonEmptyString(name) || name.trim().length < 2) errors.name = 'Name is required';
  if (!isNonEmptyString(email) || !isEmail(email)) errors.email = 'Valid email is required';
  if (!isNonEmptyString(password) || password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (Object.keys(errors).length > 0) return { errors };
  return { value: { name: name.trim(), email: email.toLowerCase(), password } };
};

const loginSchema = (body) => {
  if (!body || typeof body !== 'object') {
    return { errors: { body: 'Invalid payload' } };
  }
  const { identifier, password } = body;
  const errors = {};
  if (!isNonEmptyString(identifier)) errors.identifier = 'Account number or user ID is required';
  if (!isNonEmptyString(password) || password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (Object.keys(errors).length > 0) return { errors };
  return { value: { identifier: identifier.trim(), password } };
};

const moneySchema = (body) => {
  if (!body || typeof body !== 'object') {
    return { errors: { body: 'Invalid payload' } };
  }
  const { amountCents } = body;
  const amountValue = asNumber(amountCents);
  if (!amountValue || !Number.isInteger(amountValue) || amountValue <= 0) {
    return { errors: { amountCents: 'Amount must be a positive integer' } };
  }
  return { value: { amountCents: amountValue } };
};

const pinSchema = (body) => {
  if (!body || typeof body !== 'object') {
    return { errors: { body: 'Invalid payload' } };
  }
  const { pin } = body;
  if (!isNonEmptyString(pin) || !pinRegex.test(pin)) {
    return { errors: { pin: 'PIN must be 4 digits' } };
  }
  return { value: { pin } };
};

const depositSchema = (body) => {
  const base = moneySchema(body);
  if (base.errors) return base;
  const { keyword } = body;
  if (keyword !== undefined && !isNonEmptyString(keyword)) {
    return { errors: { keyword: 'Keyword must be a non-empty string' } };
  }
  return { value: { amountCents: base.value.amountCents, keyword: keyword ? keyword.trim() : undefined } };
};

const withdrawSchema = (body) => {
  if (!body || typeof body !== 'object') {
    return { errors: { body: 'Invalid payload' } };
  }
  const { 
    amountCents, 
    pin, 
    beneficiaryName, 
    beneficiaryEmail, 
    beneficiaryBank, 
    beneficiaryAccount,
    beneficiaryRoutingNumber,
    beneficiarySwiftCode,
    beneficiaryIbanNumber
  } = body;
  
  const base = moneySchema({ amountCents });
  const errors = { ...(base.errors ?? {}) };
  
  if (!isNonEmptyString(pin) || !pinRegex.test(pin)) errors.pin = 'PIN must be 4 digits';
  if (!isNonEmptyString(beneficiaryName)) errors.beneficiaryName = 'Beneficiary name is required';
  if (!isNonEmptyString(beneficiaryEmail) || !isEmail(beneficiaryEmail)) errors.beneficiaryEmail = 'Valid beneficiary email is required';
  if (!isNonEmptyString(beneficiaryBank)) errors.beneficiaryBank = 'Beneficiary bank is required';
  if (!isNonEmptyString(beneficiaryAccount)) errors.beneficiaryAccount = 'Beneficiary account is required';
  
  if (Object.keys(errors).length > 0) return { errors };
  
  return {
    value: {
      amountCents: base.value.amountCents,
      pin,
      beneficiaryName: beneficiaryName.trim(),
      beneficiaryEmail: beneficiaryEmail.toLowerCase(),
      beneficiaryBank: beneficiaryBank.trim(),
      beneficiaryAccount: beneficiaryAccount.trim(),
      // Optional fields - only include if they exist and are non-empty strings
      ...(isNonEmptyString(beneficiaryRoutingNumber) && { beneficiaryRoutingNumber: beneficiaryRoutingNumber.trim() }),
      ...(isNonEmptyString(beneficiarySwiftCode) && { beneficiarySwiftCode: beneficiarySwiftCode.trim() }),
      ...(isNonEmptyString(beneficiaryIbanNumber) && { beneficiaryIbanNumber: beneficiaryIbanNumber.trim() })
    }
  };
};

const transferSchema = (body) => {
  if (!body || typeof body !== 'object') {
    return { errors: { body: 'Invalid payload' } };
  }
  const { amountCents, toAccountNumber, pin } = body;
  const base = moneySchema({ amountCents });
  const errors = { ...(base.errors ?? {}) };
  
  if (!isNonEmptyString(toAccountNumber) || !/^\d{10}$/.test(toAccountNumber.trim())) {
    errors.toAccountNumber = 'Recipient account number must be 10 digits';
  }
  if (!isNonEmptyString(pin) || !pinRegex.test(pin)) errors.pin = 'PIN must be 4 digits';
  
  if (Object.keys(errors).length > 0) return { errors };
  return { value: { amountCents: base.value.amountCents, toAccountNumber: toAccountNumber.trim(), pin } };
};

const externalTransferSchema = (body) => withdrawSchema(body);

module.exports = {
  registerSchema,
  loginSchema,
  pinSchema,
  depositSchema,
  withdrawSchema,
  transferSchema,
  externalTransferSchema
};