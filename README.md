# fuse-wallet
A wallet system API where users can perform transactions

## This API assumes the following functionalities and constraints to enforce security and integrity
- A security private key will be generated for users on sign up
- Abilities for users to be able to fund (with either card or bank transfer) and withdraw money to their wallet using the [Flutterwave](https://flutterwave.com/us/) payment gateway.
- users can only use that security key for recovering their transaction pin.
- The security key has to be kept in an ultrasafe manner as there is no way for users to recover their account once they lose the key

- Live URL [here](https://fuse-wallet.herokuapp.com/api/v1)
- Find the API documentation [here](https://documenter.getpostman.com/view/11690328/Uz5KkEQF)


### Install Pacakges

```
$ npm install
```
or

```
$ yarn
```
Then you can then finally start the development server with the command

```
$ npm run start:dev
```
or

```
$ yarn start:dev
```

