package IBEcrypto

import (
	"encoding/hex"
	"errors"
	"fmt"
	"v.io/x/lib/ibe"
)

func encrypt(message string, pk ibe.Params, ID string) ([]byte, error) {
	fmt.Println("-----> Encryption part")
	overhead := pk.CiphertextOverhead()
	messageBytes, err := hex.DecodeString(message)
	C := make([]byte, len(messageBytes)+overhead)
	if err != nil {
		return C, errors.New("hex decoding fails")
	}
	err2 := pk.Encrypt(ID, messageBytes, C)
	if err2 != nil {
		// encryption is not ok
		return C, errors.New("encryption fails")
	}

	fmt.Println("Encryption Success")
	return C, nil
}
