# simple order contract 사용법

### 개요

- Klaytn Baobab 네트워크 환경
- 내부 시연을 위한 Function Method 확인 용 컨트랙트

Method

- createOrder : 0xb8fc59ba
- updateOrder : 0xef010669

### 준비사항

.env 설정파일 내 DEPLOY_PRIKEY 배포자의 private key 넣기 (0x가 빠진 64 length 문자열)

### Contarct Deploy

```
# node deploy/simpleorder/deploy-simpleOrder.js [network] [whitelist]
# example: node deploy/simpleorder/deploy-simpleOrder.js baobab 0x86efda42d9884505c036e5834ef457014c0287ce
```

### Contract Write

[ca]는 위 deploy로 부터 나온 address

```
# node deploy/simpleorder/write-createOrder.js [network] [ca] [orderId] [routeCount] [code]
# example: node deploy/simpleorder/write-createOrder.js baobab 0x04945024b1ea897c74439ad8c894da6614dc6392 order001 1 20
# example: node deploy/simpleorder/write-updateOrder.js baobab 0x04945024b1ea897c74439ad8c894da6614dc6392 order001 20
```

### Contract Read

주문 상태 확인 call

```
# node deploy/simpleorder/view-simpleOrder.js [network] [ca] [orderId]
# example: node deploy/simpleorder/view-simpleOrder.js baobab 0x04945024b1ea897c74439ad8c894da6614dc6392 order001
```
