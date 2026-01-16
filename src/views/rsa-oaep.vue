<template>
  <div class="p-4 flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold">RSA-OAEP Tool</h2>
      <Button label="Generate Key Pair" @click="generateKeyPair" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label class="font-semibold">Public Key</label>
        <Textarea v-model="pemKeyPair.publicKey" rows="5" class="w-full" placeholder="Public Key" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="font-semibold">Private Key</label>
        <Textarea
          v-model="pemKeyPair.privateKey"
          rows="5"
          class="w-full"
          placeholder="Private Key"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <h3 class="font-bold text-lg">Encryption</h3>
        <label>Plain Text</label>
        <Textarea
          v-model="plainTextInput"
          rows="3"
          class="w-full"
          placeholder="Enter text to encrypt"
        />
        <Button label="Encrypt" @click="handleEncrypt" />
        <label>Encrypted Output (Base64)</label>
        <Textarea
          v-model="encryptedData"
          rows="3"
          class="w-full"
          readonly
          placeholder="Encrypted result"
        />
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="font-bold text-lg">Decryption</h3>
        <label>Cipher Text (Base64)</label>
        <Textarea
          v-model="cipherTextInput"
          rows="3"
          class="w-full"
          placeholder="Enter text to decrypt"
        />
        <Button label="Decrypt" @click="handleDecrypt" severity="secondary" />
        <label>Decrypted Output</label>
        <Textarea
          v-model="decryptedData"
          rows="3"
          class="w-full"
          readonly
          placeholder="Decrypted result"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="RsaOaep">
import { RSAUtils } from '@kernelift/utils';
import { shallowRef, ref } from 'vue';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';

const pemKeyPair = shallowRef({
  publicKey: '',
  privateKey: ''
});

const plainTextInput = ref('');
const cipherTextInput = ref('');

const encryptedData = shallowRef('');
const decryptedData = shallowRef('');

function generateKeyPair() {
  const keyPair = RSAUtils.generateKeyPair();
  pemKeyPair.value = {
    publicKey: keyPair.publicKeyPem,
    privateKey: keyPair.privateKeyPem
  };
}

function handleEncrypt() {
  try {
    if (!pemKeyPair.value.publicKey) {
      alert('Public key is not generated yet.');
      return;
    }
    if (!plainTextInput.value) {
      alert('Please enter plain text.');
      return;
    }
    encryptedData.value = RSAUtils.encrypt(
      plainTextInput.value,
      RSAUtils.pemToPublicKey(pemKeyPair.value.publicKey)
    );
    // Auto fill decryption input for convenience
    cipherTextInput.value = encryptedData.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Encryption failed: ' + e.message);
  }
}

function handleDecrypt() {
  try {
    if (!pemKeyPair.value.privateKey) {
      alert('Private key is not generated yet.');
      return;
    }
    if (!cipherTextInput.value) {
      alert('Please enter cipher text.');
      return;
    }
    decryptedData.value = RSAUtils.decrypt(
      cipherTextInput.value,
      RSAUtils.pemToPrivateKey(pemKeyPair.value.privateKey)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Decryption failed: ' + e.message);
  }
}
</script>

<style lang="scss" scoped></style>
