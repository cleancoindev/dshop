// A utility script for shop configs.
//
// Note: easiest is to run the script from local after having setup
// a SQL proxy to prod and the ENCRYPTION_KEY env var.
//
// Examples:
//  - dump network and shop config
//  node configCli.js --networkId=1 --shopName=<shopName> --operation=dump
//  - get a shop's config value for a specific key
//  node configCli.js --networkId=1 --shopName=<shopName> --operation=get --key=<key>
//  - get a config value for all the shops
//  node configCli.js --networkId=1 --allShops --operation=get --key=<key>
//  - set a shop's config value
//  node configCli.js --networkId=1 --shopName=<shopName> --operation=get --key=<key> --value=<value>
//

const { Network, Shop } = require('../models')
const { getLogger } = require('../utils/logger')
const log = getLogger('cli')

const { getConfig, setConfig } = require('../utils/encryptedConfig')

const program = require('commander')

program
  .requiredOption(
    '-o, --operation <operation>',
    'Action to perform: [dump|get|set|del]'
  )
  .requiredOption('-n, --networkId <id>', 'Network id: [1,4,999]')
  .option('-i, --shopId <id>', 'Shop Id')
  .option('-n, --shopName <name>', 'Shop Name')
  .option('-a, --allShops', 'Apply the operation to all shops')
  .option('-k, --key <name>', 'Shop config key')
  .option('-v, --value <name>', 'Shop config value')

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)

/**
 * Dumps a shop config on the console.
 * @param {models.Network} network
 * @param {models.Shop} shop
 * @returns {Promise<void>}
 */
async function dump(network, shops) {
  const networkConfig = getConfig(network.config)
  log.info('Network Id:', network.networkId)
  log.info('Network Config:')
  log.info(networkConfig)

  for (const shop of shops) {
    const shopConfig = getConfig(shop.config)
    log.info('Shop Id:', shop.id)
    log.info('Shop Name:', shop.name)
    log.info('Shop Config:')
    log.info(shopConfig)
  }
}

async function getKey(shops, key) {
  if (!key) {
    throw new Error('Argument key must be defined')
  }
  for (const shop of shops) {
    try {
      const shopConfig = getConfig(shop.config)
      log.info(`Shop ${shop.id} ${shop.name} config: ${key}=${shopConfig[key]}`)
    } catch (e) {
      log.error(
        `Failed loading shop config for shop ${shop.id} ${shop.name}: ${e}`
      )
    }
  }
}

async function setKey(shops, key, val) {
  if (shops.length > 1) {
    throw new Error('Set operation not supported on more than 1 shop.')
  }
  const shop = shops[0]
  if (!key) {
    throw new Error('Argument key must be defined')
  }
  if (!val) {
    throw new Error('Argument value must be defined')
  }
  log.info(`Setting ${key} to ${val} on the shop's config...`)
  const shopConfig = getConfig(shop.config)
  shopConfig[key] = val
  shop.config = setConfig(shopConfig, shop.config)
  await shop.save()
  log.info('Done')
}

async function delKey(shops, key) {
  if (shops.length > 1) {
    throw new Error('Del operation not supported on more than 1 shop.')
  }
  if (!key) {
    throw new Error('Argument key must be defined')
  }
  const shop = shops[0]
  log.info(`Deleting ${key} from the shop's config...`)
  const shopConfig = getConfig(shop.config)
  delete shopConfig[key]
  shop.config = setConfig(shopConfig, shop.config)
  await shop.save()
  log.info('Done')
}

async function _getNetwork(config) {
  const network = await Network.findOne({
    where: { networkId: config.networkId, active: true }
  })
  if (!network) {
    throw new Error(`No active network with id ${config.networkId}`)
  }
  return network
}

async function _getShops(config) {
  let shops
  if (config.shopId) {
    const shop = await Shop.findOne({ where: { id: config.shopId } })
    if (!shop) {
      throw new Error(`No shop with id ${config.shopId}`)
    }
    log.info(`Loaded shop ${shop.name} (${shop.id})`)
    shops = [shop]
  } else if (config.shopName) {
    const shop = await Shop.findOne({ where: { name: config.shopName } })
    if (!shop) {
      throw new Error(`No shop with name ${config.shopName}`)
    }
    log.info(`Loaded shop ${shop.name} (${shop.id})`)
    shops = [shop]
  } else if (config.allShops) {
    shops = await Shop.findAll({ order: [['id', 'asc']] })
    log.info(`Loaded ${shops.length} shops`)
  } else {
    throw new Error('Must specify shopId or shopName')
  }
  return shops
}

async function main(config) {
  const network = await _getNetwork(config)
  const shops = await _getShops(config)

  if (config.operation === 'dump') {
    await dump(network, shops)
  } else if (config.operation === 'get') {
    await getKey(shops, config.key)
  } else if (config.operation === 'set') {
    await setKey(shops, config.key, config.value)
  } else if (config.operation === 'del') {
    await delKey(shops, config.key, config.value)
  } else {
    throw new Error(`Unsupported operation ${config.operation}`)
  }
}

//
// MAIN
//

main(program)
  .then(() => {
    log.info('Finished')
    process.exit()
  })
  .catch((err) => {
    log.error('Failure: ', err)
    log.error('Exiting')
    process.exit(-1)
  })
