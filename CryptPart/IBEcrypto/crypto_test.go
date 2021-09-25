package IBEcrypto

import (
	"github.com/zbh888/crypto/ibe"
	"math/big"
	"reflect"
	"testing"
	"vuvuzela.io/crypto/bn256"
	"vuvuzela.io/crypto/rand"
)

func Test(t *testing.T) {
	// Key Generation, private key is not master secret
	PK,secret := ibe.Setup(rand.Reader)
	message := "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000037f20d96a0ed94e7ae25661ffdcb00155b27ca4d0000000000000000000000000000000000000000000000000000000000000002c0de000000000000000000000000000000000000000000000000000000000000"
	ID := "3000"
	SK := ibe.Extract(secret, []byte(ID))
	// Encryption
	Cipher, err := encrypt(message, PK, ID)
	if err != nil {
		t.Error(err)
	}
	m, err := decrypt(Cipher, SK)
	if err != nil {
		t.Error(err)
	}
	if !reflect.DeepEqual(message, m) {
		t.Error("Not equal")
	}
}

func f(x int64) *big.Int {
	return big.NewInt( 1234 + 166*x*x + 94*x*x)
}

// threshold 3, player 3
// These tests are built based on they already run shamir secret sharing
// So the secret is 1234, and they have their shares, the threshold is 3
func Test2(t *testing.T) {
	index2Share := f(2)
	index4Share := f(4)
	index5Share := f(5)
	S := []uint32{2,4,5}
	secret := big.NewInt(0)
	index2Share.Mul(LagrangeCoefficient(2,S), index2Share)
	index4Share.Mul(LagrangeCoefficient(4,S), index4Share)
	index5Share.Mul(LagrangeCoefficient(5,S), index5Share)
	secret.Add(secret, index2Share)
	secret.Add(secret, index4Share)
	secret.Add(secret, index5Share)
	secret.Mod(secret, bn256.Order)
	// Secret has been recovered which is 1234
	if secret.Cmp(big.NewInt(1234)) != 0 {
		t.Error("fail to give secret")
	}
	// For now, player 2,4,5 have their shares. They are going to process the share and submit the processed key share
	// In vuvuzela.io/crypto/ibe they choose to encrypt using the base generator of G1. So for testing purpose
	// This P can not be random, but it shouldn't affect the security since the secret is unknown
	P := new(bn256.G1).ScalarBaseMult(big.NewInt(1))
	message := "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000037f20d96a0ed94e7ae25661ffdcb00155b27ca4d0000000000000000000000000000000000000000000000000000000000000002c0de000000000000000000000000000000000000000000000000000000000000"
	ID := "3000"
	index2PKshare, index2IdentityKshare := SecretShareProcess(index2Share, P, ID, 2, S)
	index4PKshare, index4IdentityKshare := SecretShareProcess(index4Share, P, ID, 4, S)
	index5PKshare, index5IdentityKshare := SecretShareProcess(index5Share, P, ID, 5, S)
	PK, SK := Aggregation(
		[]*ibe.MasterPublicKey{index2PKshare, index4PKshare, index5PKshare},
		[]*ibe.IdentityPrivateKey{index2IdentityKshare, index4IdentityKshare, index5IdentityKshare})
	Cipher, _ := encrypt(message, PK, ID)
	m, _ := decrypt(Cipher, SK)
	if !reflect.DeepEqual(message, m) {
		t.Error("Not equal")
	}
}

// threshold 3, player 4
func Test3(t *testing.T) {
	index2Share := f(2)
	index3Share := f(3)
	index4Share := f(4)
	index5Share := f(5)
	S := []uint32{2,3,4,5}
	secret := big.NewInt(0)
	index2Share.Mul(LagrangeCoefficient(2,S), index2Share)
	index3Share.Mul(LagrangeCoefficient(3,S), index3Share)
	index4Share.Mul(LagrangeCoefficient(4,S), index4Share)
	index5Share.Mul(LagrangeCoefficient(5,S), index5Share)
	secret.Add(secret, index2Share)
	secret.Add(secret, index3Share)
	secret.Add(secret, index4Share)
	secret.Add(secret, index5Share)
	secret.Mod(secret, bn256.Order)
	if secret.Cmp(big.NewInt(1234)) != 0 {
		t.Error("fail to give secret")
	}
	P := new(bn256.G1).ScalarBaseMult(big.NewInt(1))
	message := "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000037f20d96a0ed94e7ae25661ffdcb00155b27ca4d0000000000000000000000000000000000000000000000000000000000000002c0de000000000000000000000000000000000000000000000000000000000000"
	ID := "3000"
	index2PKshare, index2IdentityKshare := SecretShareProcess(index2Share, P, ID, 2, S)
	index3PKshare, index3IdentityKshare := SecretShareProcess(index2Share, P, ID, 3, S)
	index4PKshare, index4IdentityKshare := SecretShareProcess(index4Share, P, ID, 4, S)
	index5PKshare, index5IdentityKshare := SecretShareProcess(index5Share, P, ID, 5, S)
	PK, SK := Aggregation(
		[]*ibe.MasterPublicKey{index2PKshare, index4PKshare, index5PKshare, index3PKshare},
		[]*ibe.IdentityPrivateKey{index3IdentityKshare, index2IdentityKshare, index4IdentityKshare, index5IdentityKshare})
	Cipher, _ := encrypt(message, PK, ID)
	m, _ := decrypt(Cipher, SK)
	if !reflect.DeepEqual(message, m) {
		t.Error("Not equal")
	}
}

// threshold 3, player 4
func Test4(t *testing.T) {
	index2Share := f(2)
	index3Share := f(3)
	index4Share := f(4)
	index5Share := f(5)
	S := []uint32{2,3,4,5}
	secret := big.NewInt(0)
	index2Share.Mul(LagrangeCoefficient(2,S), index2Share)
	index3Share.Mul(LagrangeCoefficient(3,S), index3Share)
	index4Share.Mul(LagrangeCoefficient(4,S), index4Share)
	index5Share.Mul(LagrangeCoefficient(5,S), index5Share)
	secret.Add(secret, index2Share)
	secret.Add(secret, index3Share)
	secret.Add(secret, index4Share)
	secret.Add(secret, index5Share)
	secret.Mod(secret, bn256.Order)
	if secret.Cmp(big.NewInt(1234)) != 0 {
		t.Error("fail to give secret")
	}
	P := new(bn256.G1).ScalarBaseMult(big.NewInt(1))
	message := "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000037f20d96a0ed94e7ae25661ffdcb00155b27ca4d0000000000000000000000000000000000000000000000000000000000000002c0de000000000000000000000000000000000000000000000000000000000000"
	ID := "3000"
	index2PKshare, index2IdentityKshare := SecretShareProcess(index2Share, P, ID, 2, S)
	index3PKshare, index3IdentityKshare := SecretShareProcess(index2Share, P, ID, 3, S)
	index4PKshare, _ := SecretShareProcess(index4Share, P, ID, 4, S)
	index5PKshare, _ := SecretShareProcess(index5Share, P, ID, 5, S)
	PK, SK := Aggregation(
		// The public key should be correct
		[]*ibe.MasterPublicKey{index2PKshare, index4PKshare, index5PKshare, index3PKshare},
		[]*ibe.IdentityPrivateKey{index3IdentityKshare, index2IdentityKshare})
	Cipher, _ := encrypt(message, PK, ID)
	m, _ := decrypt(Cipher, SK)
	if reflect.DeepEqual(message, m) {
		t.Error("Should be not equal")
	}
}


