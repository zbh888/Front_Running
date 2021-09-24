package IBEcrypto

import (
	"github.com/zbh888/crypto/ibe"
	"vuvuzela.io/crypto/bn256"
	"math/big"
)

// http://cryptojedi.org/papers/dclxvi-20100714.pdf

// https://github.com/vuvuzela/crypto/blob/master/bn256/bn256.go

// https://github.com/vuvuzela/crypto/blob/master/ibe/ibe.go

// signer is the current index, S contains the other participated key holders.
// P is random generator
func SecretShareProcess(share *big.Int, P *bn256.G1, ID string, signer uint32, S []uint32) (*ibe.MasterPublicKey, *ibe.IdentityPrivateKey) {
	scaler := big.NewInt(1).Mul(LagrangeCoefficient(signer, S), share)
	scaler.Mod(scaler, bn256.Order)

	public := new(bn256.G1).ScalarMult(P, scaler)
	retPk := new(ibe.MasterPublicKey).SetValue(public)
	retSk := new(ibe.MasterPrivateKey).SetValue(scaler)
	retIdentityK := ibe.Extract(retSk, []byte(ID))
	return retPk, retIdentityK
}

// publish Publickey, Save identityKey for use
func Aggregation(PkShares []*ibe.MasterPublicKey, SkShares[] *ibe.IdentityPrivateKey) (*ibe.MasterPublicKey, *ibe.IdentityPrivateKey) {
	PK := new(ibe.MasterPublicKey).Aggregate(PkShares...)
	SK := new(ibe.IdentityPrivateKey).Aggregate(SkShares...)
	return PK, SK
}

func LagrangeCoefficient(signer uint32, S []uint32) *big.Int {
	nominator := big.NewInt(1)
	denominator := big.NewInt(1)
	for _, s := range S {
		if s != signer {
			nominator.Mul(nominator, big.NewInt(int64(s)))
			nominator.Mod(nominator,bn256.Order)

			denominator.Mul(denominator,
				big.NewInt(1).Add(
					big.NewInt(int64(s)),
					big.NewInt(1).Neg(big.NewInt(int64(signer)))))
			denominator.Mod(denominator, bn256.Order)
		}
	}
	return big.NewInt(1).Mul(
		nominator, big.NewInt(1).ModInverse(denominator,bn256.Order)) //Inverse will panic if denominator is 0
}