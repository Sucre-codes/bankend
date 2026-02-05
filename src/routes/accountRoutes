const { Router } = require('express');
const {
  deposit,
  getProfile,
  getTransactions,
  transfer,
  withdraw,
  setPinHandler,
  externalTransferHandler,
  createCard
  } = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  depositSchema,
  externalTransferSchema,
  pinSchema,
  transferSchema,
  withdrawSchema
} = require('../utils/validation');

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.post('/pin', validateBody(pinSchema), setPinHandler);
router.post('/virtual-card', createCard);
router.post('/deposit', validateBody(depositSchema), deposit);
router.post('/withdraw', validateBody(withdrawSchema), withdraw);
router.post('/transfer', validateBody(transferSchema), transfer);
router.post('/external-transfer', validateBody(externalTransferSchema), externalTransferHandler);
router.get('/transactions', getTransactions);

module.exports = router;