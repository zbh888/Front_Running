package IBEcrypto

import (
	"reflect"
	"testing"
	"v.io/x/lib/ibe"
)

func Test(t *testing.T) {
	master, _ := ibe.SetupBB1()
	message := "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000037f20d96a0ed94e7ae25661ffdcb00155b27ca4d0000000000000000000000000000000000000000000000000000000000000002c0de000000000000000000000000000000000000000000000000000000000000"
	ID := "3000"
	// Key Generation, private key is not master secret
	SK, _ := master.Extract(ID)
	// Encryption
	Cipher, err := encrypt(message, master.Params(), ID)
	if err != nil {
		t.Error(err)
	}
	m, err := decrypt(Cipher, master.Params().CiphertextOverhead(), SK)
	if err != nil {
		t.Error(err)
	}
	if !reflect.DeepEqual(message, m) {
		t.Error("Not equal")
	}
}
