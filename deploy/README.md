# 스크립트 사용법

### 준비사항

.env 설정파일 내 DEPLOY_PRIKEY 배포자의 private key 넣기 (0x가 빠진 64 length 문자열)

### ERC-20 Token Contarct Deploy

```
yarn deploy:erc20:ropsten

# node deploy/deploy-erc20.js [network] [name] [symbol] [supply]
# example: node deploy/deploy-erc20.js ropsten TDKA TDKA 10000
```

### ERC-20 Token Transfer

```
# node deploy/transfer-erc20.js [network] [ca] [to adderss] [amount]
# example: node deploy/transfer-erc20.js ropsten 0xB14a2Cd2f64C9AE1A2f10676bab1634D73C5CCbe 0x86efda42d9884505c036e5834ef457014c0287ce 100
```
