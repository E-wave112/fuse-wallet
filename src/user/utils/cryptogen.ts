// eslint-disable-next-line @typescript-eslint/no-var-requires
const coinkey = require('coinkey');
import { WalletKey } from './cryptotypes';

export class GenerateAddressWalletKey {
    static generateAddressAndKey(): WalletKey {
        const coinKeyInstance = coinkey.createRandom();
        return {
            privateKey: coinKeyInstance.privateKey.toString('hex'),
        };
    }
}
