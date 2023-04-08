# Front_Running

This is the very begining of [Fairblock: Preventing blockchain front-running with minimal overheads](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=rqRcfVsAAAAJ&citation_for_view=rqRcfVsAAAAJ:d1gkVwhDpl0C)

[ETHDKG implementation](https://github.com/PhilippSchindler/ethdkg/)

[Ferveo for VSS on the public chain](https://anoma.network/blog/ferveo-a-distributed-key-generation-scheme-for-front-running-protection/)

[Intro video](https://youtu.be/otGWjS9zDeE)

# Description

`FR` contains solidity smart contracts.

`CryptPart` contains the Golang code for IBE threshold encryption and decryption. This is built upon the IBE implementation of `vuvuzela/crypto`.

# Run tests

## FR

1. `cd FR`

2. `truffle compile`

3. open Ganache, make sure what in the `truffle-config.js` matches with Ganache

4. `truffle  migrate`

5. `truffle test --show-events` or `truffle test`

## CryptPart

1. `cd CryptPart/IBEcrypto`

2. `go test`
