/**
 * IMPORTANT: If you add an entry to an enum that is a representation of a DB
 * enum, do not forget to add a migration script to add the enum to the DB.
 */

class Enum extends Array {
  constructor(...args) {
    super(...args)

    for (const k of args) {
      this[k] = k
    }
  }
}

const AdminLogActions = new Enum(
  'ShopCreated',
  'ShopConfigUpdated',
  'ShopDeleted',
  'ShopPublished',
  'UserAdded',
  'UserEdited',
  'UserDeleted'
)

const OrderPaymentStatuses = new Enum('Paid', 'Refunded', 'Pending', 'Rejected')

const OrderOfferStatuses = new Enum(
  'OfferCreated',
  'OfferAccepted',
  'OfferFinalized',
  'OfferWithdrawn',
  'OfferDisputed',
  'OfferData'
)

const OrderPaymentTypes = new Enum(
  'CreditCard',
  'PayPal',
  'Offline',
  'CryptoCurrency',
  'Uphold'
)

const TransactionStatuses = new Enum('Pending', 'Confirmed', 'Failed')
const TransactionTypes = new Enum('OfferCreated', 'Payment')
const ShopDeploymentStatuses = new Enum('Pending', 'Success', 'Failure')
const ShopDomainStatuses = new Enum('Pending', 'Success', 'Failure')

const EtlJobStatuses = new Enum('Running', 'Success', 'Failure')

// Not a DB enum
const BucketExistence = new Enum('Exists', 'DoesNotExist', 'PermissionDenied')

const ExternalServices = {
  Printful: 'printful'
}

const PrintfulWebhookEvents = {
  PackageShipped: 'package_shipped',
  PackageReturned: 'package_returned',
  OrderFailed: 'order_failed',
  OrderCanceled: 'order_canceled',
  ProductSynced: 'product_synced',
  ProductUpdated: 'product_updated',
  OrderPutHold: 'order_put_hold',
  OrderRemoveHold: 'order_remove_hold'
}

module.exports = {
  AdminLogActions,
  EtlJobStatuses,
  OrderPaymentStatuses,
  OrderOfferStatuses,
  OrderPaymentTypes,
  ShopDeploymentStatuses,
  ShopDomainStatuses,
  TransactionStatuses,
  TransactionTypes,
  PrintfulWebhookEvents,
  ExternalServices,
  BucketExistence
}
