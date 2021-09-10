package IBEcrypto

import (
	"encoding/hex"
	"errors"
	"fmt"
	"v.io/x/lib/ibe"
)

func decrypt(C []byte, overhead int, sk ibe.PrivateKey) (string, error) {
	res := make([]byte, len(C)-overhead)
	err := sk.Decrypt(C, res)
	if err != nil {
		return "", errors.New("decryption fails")
	}
	fmt.Println("-----> Decryption Success")
	return hex.EncodeToString(res), nil
}
