<template>
  <div class="p-4 flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold">AES-GCM Tool</h2>
      <div class="flex gap-2">
        <Button label="Generate Key" @click="generateKey" />
        <Button label="Generate IV" @click="generateIv" severity="secondary" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label class="font-semibold">Key (Base64)</label>
        <Textarea v-model="key" rows="2" class="w-full" placeholder="AES Key (Base64)" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="font-semibold">IV (Base64)</label>
        <Textarea
          v-model="iv"
          rows="2"
          class="w-full"
          placeholder="Initialization Vector (Base64)"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="font-semibold">Additional Data (Optional)</label>
      <Textarea
        v-model="additionalData"
        rows="1"
        class="w-full"
        placeholder="Additional Authenticated Data"
      />
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

        <label>Cipher Text Output (Base64)</label>
        <Textarea
          v-model="encryptedData"
          rows="3"
          class="w-full"
          readonly
          placeholder="Encrypted result"
        />

        <label>Auth Tag Output (Base64)</label>
        <Textarea
          v-model="authTag"
          rows="1"
          class="w-full"
          readonly
          placeholder="Authentication Tag"
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

        <label>Auth Tag (Base64)</label>
        <Textarea v-model="authTagInput" rows="1" class="w-full" placeholder="Authentication Tag" />

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

<script lang="ts" setup name="AesGcm">
import { AesGcmEncryption } from '@kernelift/utils';
import { ref } from 'vue';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';

const aes = new AesGcmEncryption();

const key = ref('');
const iv = ref('');
const additionalData = ref('');

const plainTextInput = ref('');
const cipherTextInput = ref('');
const authTagInput = ref('');

const encryptedData = ref('');
const authTag = ref('');
const decryptedData = ref('');

function generateKey() {
  key.value = aes.generateKey();
}

function generateIv() {
  iv.value = aes.generateIv();
}

function handleEncrypt() {
  try {
    if (!key.value) {
      alert('Key is required.');
      return;
    }

    // If IV is empty, generate one
    if (!iv.value) {
      generateIv();
    }

    if (!plainTextInput.value) {
      alert('Please enter plain text.');
      return;
    }

    const result = aes.encrypt(plainTextInput.value, key.value, iv.value, additionalData.value);

    encryptedData.value = result.ciphertext;
    authTag.value = result.tag;

    // Auto fill decryption inputs for convenience
    cipherTextInput.value = result.ciphertext;
    authTagInput.value = result.tag;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Encryption failed: ' + e.message);
  }
}

function handleDecrypt() {
  try {
    if (!key.value) {
      alert('Key is required.');
      return;
    }
    if (!iv.value) {
      alert('IV is required.');
      return;
    }
    if (!cipherTextInput.value) {
      alert('Please enter cipher text.');
      return;
    }
    if (!authTagInput.value) {
      alert('Auth Tag is required for GCM.');
      return;
    }

    decryptedData.value = aes.decrypt(
      cipherTextInput.value,
      key.value,
      iv.value,
      authTagInput.value,
      additionalData.value
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Decryption failed: ' + e.message);
  }
}
</script>

<style lang="scss" scoped></style>
