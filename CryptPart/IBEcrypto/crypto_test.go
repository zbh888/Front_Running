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

// threshold 3, player 3, all honest
// These tests are built based on they already run shamir secret sharing
// So the secret is 1234, and they have their shares, the threshold is 3
func Test2(t *testing.T) {
	index2Share := f(2)
	index4Share := f(4)
	index5Share := f(5)
	S := []uint32{2,4,5}
	secret := big.NewInt(0)
	index2Share.Mul(lagrangeCoefficient(2,S), index2Share)
	index4Share.Mul(lagrangeCoefficient(4,S), index4Share)
	index5Share.Mul(lagrangeCoefficient(5,S), index5Share)
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
	c2 := generateCommitment(index2Share, P, 2)
	c4 := generateCommitment(index4Share, P, 4)
	c5 := generateCommitment(index5Share, P, 5)
	PK := AggregationPK([]Commitment{c2,c4,c5},S)
	message := "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000037f20d96a0ed94e7ae25661ffdcb00155b27ca4d0000000000000000000000000000000000000000000000000000000000000002c0de000000000000000000000000000000000000000000000000000000000000"
	ID := "3000"
	// Then they want to send the processed share
	s2 := SecretShareProcess(index2Share,ID,2)
	s4 := SecretShareProcess(index4Share,ID,4)
	s5 := SecretShareProcess(index5Share,ID,5)
	Cipher, _ := encrypt(message, PK, ID)

	SK,_ := AggregationSK([]SentShare{s2,s4,s5}, []Commitment{c2,c4,c5}, ID, S)
	m, _ := decrypt(Cipher, SK)
	if !reflect.DeepEqual(message, m) {
		t.Error("Not equal")
	}
}

