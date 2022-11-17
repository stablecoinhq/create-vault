# Vault操作スクリプト

## install

```
npm install
```

## prepare

以下の`.env`ファイルを用意する

```
INFURA_API_KEY="INFURAのAPIキー"
CONFIRMATION_HEIGHT=0 // それぞれのTxに必要な承認高
PRIVATE_KEY="秘密鍵"
```

generate typechain

```
npx hardhat clean && npx hardhat typechain
```

## run

show hardhat task list

```
npm run
npm run help
```

## For example

lock some maker token for voting

```
npm run lockForVote:goerli -- --amount 1
```
