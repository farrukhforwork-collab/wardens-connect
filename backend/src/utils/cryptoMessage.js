const crypto = require('crypto');
const env = require('../config/env');

const getKey = () => {
  const key = env.messageEncryptionKey;
  if (!key || key.length !== 64) {
    throw new Error('MESSAGE_ENCRYPTION_KEY must be a 32-byte hex string.');
  }
  return Buffer.from(key, 'hex');
};

const encryptMessage = (plaintext) => {
  if (!plaintext) return null;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex')
  };
};

const decryptMessage = (payload) => {
  if (!payload) return '';
  const key = getKey();
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const encrypted = Buffer.from(payload.content, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

module.exports = { encryptMessage, decryptMessage };
